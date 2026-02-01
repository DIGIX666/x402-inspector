import { createHash, randomUUID } from "crypto";

export type EventType = "payment_required" | "payment_success" | "payment_failed";

export type ErrorCategory =
  | "insufficient_balance"
  | "signature_failure"
  | "pricing_mismatch"
  | "rpc_error";

export type ErrorInfo = {
  code: string;
  category: ErrorCategory;
  message: string;
};

export type X402Event = {
  id: string;
  schema_version: number;
  timestamp: number;
  event_type: EventType;
  request_id: string;
  trace_id: string;
  endpoint: string;
  status: number;
  amount?: number;
  currency?: string;
  payer_anonymized?: string;
  error?: ErrorInfo;
  metadata?: Record<string, unknown>;
};

const EVENT_SCHEMA_VERSION = 1;
const events: X402Event[] = [];

export function addEvent(event: X402Event) {
  events.push(event);
  if (events.length > 5000) events.shift();
}

export function getEvents() {
  return events;
}

export function getRequestIds(headers: Headers) {
  const requestId = headers.get("x-request-id") || randomUUID();
  const traceId = headers.get("x-trace-id") || randomUUID();
  return { requestId, traceId };
}

function anonymizePayer(payer?: string) {
  if (!payer) return undefined;
  const salt = process.env.ANON_SALT || "dev-salt";
  return createHash("sha256").update(`${salt}:${payer}`).digest("hex");
}

export function buildEvent({
  eventType,
  endpoint,
  status,
  amount,
  currency,
  payer,
  requestId,
  traceId,
  error,
  metadata
}: {
  eventType: EventType;
  endpoint: string;
  status: number;
  amount?: number;
  currency?: string;
  payer?: string;
  requestId: string;
  traceId: string;
  error?: ErrorInfo;
  metadata?: Record<string, unknown>;
}): X402Event {
  return {
    id: randomUUID(),
    schema_version: EVENT_SCHEMA_VERSION,
    timestamp: Date.now(),
    event_type: eventType,
    request_id: requestId,
    trace_id: traceId,
    endpoint,
    status,
    amount,
    currency,
    payer_anonymized: anonymizePayer(payer),
    error,
    metadata
  };
}
