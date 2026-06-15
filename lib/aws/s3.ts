/**
 * S3 service layer — image upload and URL generation.
 *
 * Usage:
 *   const url = await uploadImageToS3(buffer, 'image/jpeg', 'inspections/run123/front.jpg');
 *
 * Falls back to returning a base64 data URL when AWS is not configured,
 * so local development keeps working without any AWS credentials.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_REGION, awsCredentials, isAwsConfigured } from './config';

export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'secondlife-uploads';

let s3Client: S3Client | null = null;
if (isAwsConfigured) {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: awsCredentials,
  });
}

/**
 * Upload a raw buffer to S3 and return the public (or signed) URL.
 * Returns a base64 data URL if S3 is not configured (local fallback).
 */
export async function uploadImageToS3(
  buffer: Buffer,
  mimeType: string,
  key: string
): Promise<string> {
  if (!s3Client || !isAwsConfigured) {
    // Local fallback: return base64 data URL
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Return the S3 HTTPS URL
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Generate a presigned URL for temporary read access to a private S3 object.
 * Expires in 1 hour by default.
 */
export async function getPresignedReadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  if (!s3Client) return key; // fallback: return as-is

  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Build the S3 key for an inspection image.
 * e.g. inspections/run_1234567890_abc/0_Front.jpg
 */
export function buildInspectionImageKey(runId: string, index: number, angle: string, ext: string): string {
  const safeAngle = angle.replace(/[^a-zA-Z0-9]/g, '_');
  return `inspections/${runId}/${index}_${safeAngle}.${ext}`;
}
