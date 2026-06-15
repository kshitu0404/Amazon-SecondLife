/**
 * Centralised AWS configuration.
 * All AWS clients are created here and exported as singletons.
 * Falls back gracefully when credentials are absent (local dev mode).
 */

// Validate the region value and catch common misconfiguration (e.g. double-assignment).
// A valid AWS region looks like: us-east-1, ap-southeast-2, eu-west-1
function resolveRegion(): string {
  const raw = process.env.AWS_REGION ?? '';

  // If the raw value contains '=' it was double-assigned (e.g. AWS_REGION=ap-southeast-2
  // accidentally becoming AWS_REGION=AWS_REGION=ap-southeast-2).  Strip the prefix.
  if (raw.includes('=')) {
    const corrected = raw.split('=').pop()?.trim() ?? 'us-east-1';
    console.warn(
      `[aws/config] AWS_REGION value "${raw}" looks malformed. ` +
        `Auto-corrected to "${corrected}". Fix your .env.local.`
    );
    return corrected;
  }

  return raw || 'us-east-1';
}

export const AWS_REGION = resolveRegion();

export const awsCredentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN
          ? { sessionToken: process.env.AWS_SESSION_TOKEN }
          : {}),
      }
    : undefined;

/** True when AWS credentials are present in the environment */
export const isAwsConfigured = !!awsCredentials;

// Log resolved configuration at startup (server-side only, no secrets)
if (typeof process !== 'undefined') {
  console.log(
    `[aws/config] region=${AWS_REGION} ` +
    `credentials=${isAwsConfigured ? 'present' : 'missing'}`
  );
}
