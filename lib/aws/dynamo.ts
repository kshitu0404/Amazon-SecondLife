/**
 * DynamoDB service layer — replaces the broken MongoDB product_journeys collection.
 *
 * Table: secondlife-journeys
 *   PK: runId (String)
 *   Sort key: none (single-item lookups by runId)
 *   GSI: lifecycleStatus-createdAt-index (for filtered list queries)
 *
 * Falls back to an in-memory Map when AWS is not configured (local dev mode).
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { AWS_REGION, awsCredentials, isAwsConfigured } from './config';
import type { ProductJourney } from '@/lib/inspection';

export const DYNAMO_TABLE = process.env.AWS_DYNAMODB_TABLE || 'secondlife-journeys';

// ── Client setup ────────────────────────────────────────────────────────────

let docClient: DynamoDBDocumentClient | null = null;
if (isAwsConfigured) {
  const raw = new DynamoDBClient({ region: AWS_REGION, credentials: awsCredentials });
  docClient = DynamoDBDocumentClient.from(raw, {
    marshallOptions: { removeUndefinedValues: true },
  });
}

// ── In-memory fallback (used when DynamoDB is not configured) ───────────────

const memStore = new Map<string, ProductJourney>();

// ── Public API ───────────────────────────────────────────────────────────────

/** Persist a new product journey (insert) */
export async function saveJourney(journey: ProductJourney): Promise<void> {
  if (!docClient) {
    memStore.set(journey.runId, journey);
    return;
  }
  await docClient.send(
    new PutCommand({ TableName: DYNAMO_TABLE, Item: journey })
  );
}

/** Retrieve a single journey by runId */
export async function getJourney(runId: string): Promise<ProductJourney | null> {
  if (!docClient) {
    return memStore.get(runId) ?? null;
  }
  const result = await docClient.send(
    new GetCommand({ TableName: DYNAMO_TABLE, Key: { runId } })
  );
  return (result.Item as ProductJourney) ?? null;
}

/** Update lifecycle status and append a status event */
export async function updateJourneyStatus(
  runId: string,
  newStatus: ProductJourney['lifecycleStatus'],
  note: string,
  actor: string
): Promise<void> {
  const now = new Date().toISOString();

  if (!docClient) {
    const existing = memStore.get(runId);
    if (existing) {
      existing.lifecycleStatus = newStatus;
      existing.updatedAt = now;
      existing.statusHistory.push({ status: newStatus, timestamp: now, note, actor });
    }
    return;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { runId },
      UpdateExpression:
        'SET lifecycleStatus = :s, updatedAt = :t, statusHistory = list_append(if_not_exists(statusHistory, :empty), :event)',
      ExpressionAttributeValues: {
        ':s': newStatus,
        ':t': now,
        ':empty': [],
        ':event': [{ status: newStatus, timestamp: now, note, actor }],
      },
    })
  );
}

/** List all journeys — supports optional filter by lifecycleStatus */
export async function listJourneys(
  filterStatus?: string,
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest'
): Promise<ProductJourney[]> {
  let items: ProductJourney[];

  if (!docClient) {
    items = Array.from(memStore.values());
  } else {
    const params: Parameters<typeof docClient.send>[0] extends ScanCommand
      ? never
      : { TableName: string; FilterExpression?: string; ExpressionAttributeValues?: Record<string, unknown> } =
      { TableName: DYNAMO_TABLE };

    if (filterStatus) {
      (params as any).FilterExpression = 'lifecycleStatus = :status';
      (params as any).ExpressionAttributeValues = { ':status': filterStatus };
    }

    const result = await docClient.send(new ScanCommand(params as any));
    items = (result.Items ?? []) as ProductJourney[];
  }

  // Sort in memory
  return items.sort((a, b) => {
    if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sortBy === 'highest')
      return (
        (b.inspectionReport?.overall_condition_score ?? 0) -
        (a.inspectionReport?.overall_condition_score ?? 0)
      );
    if (sortBy === 'lowest')
      return (
        (a.inspectionReport?.overall_condition_score ?? 0) -
        (b.inspectionReport?.overall_condition_score ?? 0)
      );
    return b.createdAt.localeCompare(a.createdAt); // newest
  });
}
