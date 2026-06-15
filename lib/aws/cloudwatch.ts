/**
 * CloudWatch structured logger.
 *
 * Writes log events to a CloudWatch log group when AWS is configured.
 * Falls back to console output in local dev so nothing breaks.
 *
 * Log group:  /secondlife/app   (default, set AWS_LOG_GROUP to override)
 * Log stream: YYYY-MM-DD        (rotates daily)
 *
 * NOTE: The sequenceToken parameter was removed from PutLogEvents in the
 * CloudWatch Logs API in 2023.  Passing it causes a 400 InvalidSequenceToken
 * error.  We now rely on the service to accept events without a token, which
 * is the current recommended approach for most use cases.
 */

import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-cloudwatch-logs';
import { AWS_REGION, awsCredentials, isAwsConfigured } from './config';

export const LOG_GROUP = process.env.AWS_LOG_GROUP || '/secondlife/app';

let cwClient: CloudWatchLogsClient | null = null;
if (isAwsConfigured) {
  cwClient = new CloudWatchLogsClient({
    region: AWS_REGION,
    credentials: awsCredentials,
  });
}

/** Returns today's date string used as the log stream name, e.g. 2025-06-15 */
function todayStream(): string {
  return new Date().toISOString().split('T')[0];
}

/** Ensures the log stream for today exists — silently ignores AlreadyExists. */
async function ensureStream(streamName: string): Promise<void> {
  if (!cwClient) return;
  try {
    await cwClient.send(
      new CreateLogStreamCommand({
        logGroupName: LOG_GROUP,
        logStreamName: streamName,
      })
    );
  } catch (err) {
    // ResourceAlreadyExistsException is expected on every call after the first.
    if (!(err instanceof ResourceAlreadyExistsException)) {
      // Any other error — log to console but don't throw; CW is non-critical.
      console.warn('[CloudWatch] ensureStream error:', err);
    }
  }
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * Emit a structured log event.
 *
 * @param level   INFO | WARN | ERROR
 * @param source  Short identifier e.g. "inspection-api"
 * @param data    Arbitrary serialisable object
 */
export async function log(
  level: LogLevel,
  source: string,
  data: Record<string, unknown>
): Promise<void> {
  // Always write to console — visible in Next.js dev terminal and Vercel logs.
  const consoleFn =
    level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  consoleFn(`[${level}] [${source}]`, JSON.stringify(data));

  if (!cwClient) return; // No AWS credentials — console only.

  const streamName = todayStream();
  await ensureStream(streamName);

  try {
    await cwClient.send(
      new PutLogEventsCommand({
        logGroupName: LOG_GROUP,
        logStreamName: streamName,
        // sequenceToken intentionally omitted — deprecated and now causes errors.
        logEvents: [
          {
            timestamp: Date.now(),
            message: JSON.stringify({
              timestamp: new Date().toISOString(),
              level,
              source,
              env: process.env.NODE_ENV ?? 'development',
              ...data,
            }),
          },
        ],
      })
    );
  } catch (err) {
    // CloudWatch failure must NEVER crash the application.
    console.warn('[CloudWatch] PutLogEvents failed:', err);
  }
}

/** Convenience wrappers */
export const logger = {
  info:  (source: string, data: Record<string, unknown>) => log('INFO',  source, data),
  warn:  (source: string, data: Record<string, unknown>) => log('WARN',  source, data),
  error: (source: string, data: Record<string, unknown>) => log('ERROR', source, data),
};
