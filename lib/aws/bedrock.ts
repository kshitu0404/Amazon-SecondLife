/**
 * Amazon Bedrock service layer — powers Nova chat assistant.
 *
 * Primary model : mistral.mistral-large-2402-v1:0  (verified working in ap-southeast-2)
 * Override via  : AWS_BEDROCK_MODEL_ID environment variable.
 *
 * Supported provider families (detected automatically from model ID prefix):
 *   mistral.*   → Mistral AI payload  { prompt, max_tokens, temperature }
 *   anthropic.* → Anthropic payload   { anthropic_version, messages[], system }
 *
 * Throws on any Bedrock error so the caller (nova-chat) can fall back to Groq.
 * The public API surface (invokeBedrockChat) is unchanged — callers pass a
 * system prompt + messages[] and receive a plain string back.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AWS_REGION, awsCredentials, isAwsConfigured } from './config';

// ── Model configuration ──────────────────────────────────────────────────────

export const BEDROCK_MODEL =
  process.env.AWS_BEDROCK_MODEL_ID || 'mistral.mistral-large-2402-v1:0';

// ── Client singleton ─────────────────────────────────────────────────────────

let bedrockClient: BedrockRuntimeClient | null = null;
if (isAwsConfigured) {
  bedrockClient = new BedrockRuntimeClient({
    region: AWS_REGION,
    credentials: awsCredentials,
  });
}

export const isBedrockConfigured = !!bedrockClient;

// ── Provider detection ───────────────────────────────────────────────────────

type BedrockProvider = 'mistral' | 'anthropic' | 'unknown';

function detectProvider(modelId: string): BedrockProvider {
  if (modelId.startsWith('mistral.'))    return 'mistral';
  if (modelId.startsWith('anthropic.') || modelId.startsWith('apac.anthropic.')) return 'anthropic';
  return 'unknown';
}

// ── Payload builders ─────────────────────────────────────────────────────────

/**
 * Mistral Bedrock payload format.
 * Uses the <s>[INST] ... [/INST] prompt template.
 * The system prompt is prepended to the first user turn.
 */
function buildMistralPayload(
  systemPrompt: string,
  messages: BedrockMessage[],
  maxTokens: number
): object {
  // Interleave messages into Mistral instruction format
  let prompt = '<s>';

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === 'user') {
      // Prepend system prompt into the first user turn
      const content = i === 0 ? `${systemPrompt}\n\n${m.content}` : m.content;
      prompt += `[INST] ${content} [/INST]`;
    } else {
      // assistant turn
      prompt += ` ${m.content}</s>`;
    }
  }

  return {
    prompt,
    max_tokens: maxTokens,
    temperature: 0.1,
  };
}

/**
 * Anthropic Claude Bedrock payload format.
 * Uses the messages API with a separate system field.
 */
function buildAnthropicPayload(
  systemPrompt: string,
  messages: BedrockMessage[],
  maxTokens: number
): object {
  return {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };
}

// ── Response extractors ──────────────────────────────────────────────────────

function extractMistralText(body: Record<string, unknown>): string {
  return (body?.outputs as Array<{ text?: string }>)?.[0]?.text ?? '';
}

function extractAnthropicText(body: Record<string, unknown>): string {
  return (body?.content as Array<{ text?: string }>)?.[0]?.text ?? '';
}

// ── Public interface ─────────────────────────────────────────────────────────

export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Invoke the configured Bedrock model with a system prompt and message history.
 *
 * @param systemPrompt  Instruction context prepended to the conversation.
 * @param messages      Ordered conversation history (user / assistant turns).
 * @param maxTokens     Maximum tokens in the response (default 500).
 * @returns             Raw text response from the model.
 * @throws              On any Bedrock error — caller should catch and fall back.
 */
export async function invokeBedrockChat(
  systemPrompt: string,
  messages: BedrockMessage[],
  maxTokens = 500
): Promise<string> {
  if (!bedrockClient) {
    throw new Error('Bedrock not configured — AWS credentials missing.');
  }

  const provider = detectProvider(BEDROCK_MODEL);
  const startMs  = Date.now();

  // Build the provider-appropriate payload
  let payload: object;
  if (provider === 'mistral') {
    payload = buildMistralPayload(systemPrompt, messages, maxTokens);
  } else if (provider === 'anthropic') {
    payload = buildAnthropicPayload(systemPrompt, messages, maxTokens);
  } else {
    throw new Error(
      `Bedrock: unsupported model provider for "${BEDROCK_MODEL}". ` +
      'Supported prefixes: mistral.*, anthropic.*'
    );
  }

  const command = new InvokeModelCommand({
    modelId:      BEDROCK_MODEL,
    contentType:  'application/json',
    accept:       'application/json',
    body:         JSON.stringify(payload),
  });

  let response;
  try {
    response = await bedrockClient.send(command);
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);
    const latency = Date.now() - startMs;

    // Surface actionable messages for the most common failure modes
    if (msg.includes('INVALID_PAYMENT_INSTRUMENT') || msg.includes('payment')) {
      throw new Error(
        `Bedrock[${BEDROCK_MODEL}]: Payment instrument required. ` +
        'Add a payment method at AWS Console → Billing → Payment methods.'
      );
    }
    if (msg.includes('Access denied') || msg.includes('not been granted') || msg.includes('Legacy')) {
      throw new Error(
        `Bedrock[${BEDROCK_MODEL}]: Model access denied in region "${AWS_REGION}". ` +
        'Enable at AWS Console → Amazon Bedrock → Model access.'
      );
    }
    if (msg.includes('not found') || msg.includes('identifier is invalid')) {
      throw new Error(
        `Bedrock[${BEDROCK_MODEL}]: Model not available in region "${AWS_REGION}". ` +
        'Use mistral.mistral-large-2402-v1:0 which is verified working.'
      );
    }

    // Log and re-throw anything else
    console.error(`[bedrock] invoke failed after ${latency}ms:`, msg);
    throw err;
  }

  const latency   = Date.now() - startMs;
  const respBody  = JSON.parse(new TextDecoder().decode(response.body)) as Record<string, unknown>;

  // Extract text using the provider-appropriate extractor
  const text = provider === 'mistral'
    ? extractMistralText(respBody)
    : extractAnthropicText(respBody);

  // Structured log — visible in terminal + CloudWatch
  console.log(
    `[bedrock] provider=${provider} model=${BEDROCK_MODEL} ` +
    `region=${AWS_REGION} latency=${latency}ms chars=${text.length}`
  );

  return text;
}
