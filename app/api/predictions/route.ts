import { NextResponse } from "next/server";
import { addEvent, buildEvent } from "../../../lib/events";
import { requireAptPayment } from "../../../lib/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payment = await requireAptPayment({
    request,
    endpoint: "/api/predictions",
    amountApt: 0.01
  });
  if (payment instanceof NextResponse) return payment;

  const { requestId, traceId, payer, metadata } = payment;
  const event = buildEvent({
    eventType: "payment_success",
    endpoint: "/api/predictions",
    status: 200,
    amount: 0.01,
    currency: "APT",
    requestId,
    traceId,
    payer,
    metadata
  });
  addEvent(event);
  const response = NextResponse.json({ ok: true, data: "predictions payload" });
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-trace-id", traceId);
  return response;
}
