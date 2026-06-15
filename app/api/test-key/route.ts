/**
 * GET /api/test-key
 *
 * Health-check endpoint that verifies every configured service.
 * Checks: Groq, S3, DynamoDB, Bedrock, CloudWatch.
 * Safe to call at any time — read-only where possible, tiny writes with immediate cleanup.
 */

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { AWS_REGION, awsCredentials, isAwsConfigured } from '@/lib/aws/config';

// ── Result shape ─────────────────────────────────────────────────────────────

interface ServiceResult {
  status: 'ok' | 'error' | 'not_configured';
  detail: string;
  latency_ms?: number;
}

// ── Test helpers ─────────────────────────────────────────────────────────────

async function testGroq(): Promise<ServiceResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { status: 'not_configured', detail: 'GROQ_API_KEY not set' };

  const t = Date.now();
  try {
    const groq = new Groq({ apiKey: key });
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
      max_tokens: 5,
    });
    const reply = res.choices[0]?.message?.content ?? '';
    return { status: 'ok', detail: `model responded: "${reply.trim()}"`, latency_ms: Date.now() - t };
  } catch (err) {
    return { status: 'error', detail: String(err), latency_ms: Date.now() - t };
  }
}

async function testS3(): Promise<ServiceResult> {
  if (!isAwsConfigured) return { status: 'not_configured', detail: 'AWS credentials not set' };

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) return { status: 'not_configured', detail: 'AWS_S3_BUCKET not set' };

  const t = Date.now();
  const testKey = `_health-check/test-${Date.now()}.txt`;

  try {
    const client = new S3Client({ region: AWS_REGION, credentials: awsCredentials });

    // 1. Verify bucket exists
    await client.send(new HeadBucketCommand({ Bucket: bucket }));

    // 2. Write a tiny test object
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: Buffer.from('secondlife-healthcheck'),
        ContentType: 'text/plain',
      })
    );

    // 3. Delete it immediately
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }));

    return {
      status: 'ok',
      detail: `bucket="${bucket}" region="${AWS_REGION}" write+delete succeeded`,
      latency_ms: Date.now() - t,
    };
  } catch (err) {
    return { status: 'error', detail: String(err), latency_ms: Date.now() - t };
  }
}

async function testDynamoDB(): Promise<ServiceResult> {
  if (!isAwsConfigured) return { status: 'not_configured', detail: 'AWS credentials not set' };

  const table = process.env.AWS_DYNAMODB_TABLE;
  if (!table) return { status: 'not_configured', detail: 'AWS_DYNAMODB_TABLE not set' };

  const t = Date.now();
  const testId = `_healthcheck_${Date.now()}`;

  try {
    const raw = new DynamoDBClient({ region: AWS_REGION, credentials: awsCredentials });
    const doc = DynamoDBDocumentClient.from(raw, {
      marshallOptions: { removeUndefinedValues: true },
    });

    // 1. Write a test item
    await doc.send(
      new PutCommand({
        TableName: table,
        Item: { runId: testId, _test: true, createdAt: new Date().toISOString() },
      })
    );

    // 2. Read it back
    const result = await doc.send(
      new GetCommand({ TableName: table, Key: { runId: testId } })
    );
    if (!result.Item) throw new Error('Item not found after write');

    // 3. Delete it
    await doc.send(
      new DeleteCommand({ TableName: table, Key: { runId: testId } })
    );

    return {
      status: 'ok',
      detail: `table="${table}" region="${AWS_REGION}" put+get+delete succeeded`,
      latency_ms: Date.now() - t,
    };
  } catch (err) {
    return { status: 'error', detail: String(err), latency_ms: Date.now() - t };
  }
}

async function testBedrock(): Promise<ServiceResult> {
  if (!isAwsConfigured) return { status: 'not_configured', detail: 'AWS credentials not set' };

  const modelId = process.env.AWS_BEDROCK_MODEL_ID || 'mistral.mistral-large-2402-v1:0';
  const t = Date.now();

  try {
    const client = new BedrockRuntimeClient({ region: AWS_REGION, credentials: awsCredentials });

    // Build payload based on model provider prefix
    let payload: object;
    let extractText: (b: any) => string;

    if (modelId.startsWith('mistral.')) {
      payload = { prompt: '<s>[INST] Reply with the single word: OK [/INST]', max_tokens: 10, temperature: 0 };
      extractText = (b) => b?.outputs?.[0]?.text ?? '';
    } else {
      // Anthropic / default fallback
      payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
      };
      extractText = (b) => b?.content?.[0]?.text ?? '';
    }

    const res = await client.send(
      new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      })
    );

    const body = JSON.parse(new TextDecoder().decode(res.body));
    const text = extractText(body).trim();

    return {
      status: 'ok',
      detail: `model="${modelId}" region="${AWS_REGION}" responded: "${text}"`,
      latency_ms: Date.now() - t,
    };
  } catch (err) {
    return { status: 'error', detail: String(err), latency_ms: Date.now() - t };
  }
}

async function testCloudWatch(): Promise<ServiceResult> {
  if (!isAwsConfigured) return { status: 'not_configured', detail: 'AWS credentials not set' };

  const logGroup = process.env.AWS_LOG_GROUP || '/secondlife/app';

  const t = Date.now();
  try {
    const client = new CloudWatchLogsClient({ region: AWS_REGION, credentials: awsCredentials });

    // Read-only check: describe the log group (creates no resources)
    const res = await client.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: logGroup, limit: 1 })
    );

    const found = res.logGroups?.some((g) => g.logGroupName === logGroup);

    return {
      status: 'ok',
      detail: found
        ? `log group "${logGroup}" exists in region "${AWS_REGION}"`
        : `credentials valid but log group "${logGroup}" not found — create it first`,
      latency_ms: Date.now() - t,
    };
  } catch (err) {
    return { status: 'error', detail: String(err), latency_ms: Date.now() - t };
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  // Run all checks in parallel
  const [groq, s3, dynamo, bedrock, cloudwatch] = await Promise.all([
    testGroq(),
    testS3(),
    testDynamoDB(),
    testBedrock(),
    testCloudWatch(),
  ]);

  const allOk = [groq, s3, dynamo, bedrock, cloudwatch].every(
    (r) => r.status === 'ok'
  );

  return NextResponse.json(
    {
      overall: allOk ? 'all_ok' : 'some_failed',
      region: AWS_REGION,
      services: { groq, s3, dynamo, bedrock, cloudwatch },
    },
    { status: allOk ? 200 : 207 } // 207 Multi-Status when some passed, some failed
  );
}
