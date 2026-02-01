import { NextResponse } from "next/server";
import { addEvent, buildEvent, getRequestIds } from "./events";
import { verifyAptosTransfer } from "./aptos";

export async function requireAptPayment({
  request,
  endpoint,
  amountApt
}: {
  request: Request;
  endpoint: string;
  amountApt: number;
}) {
  const { requestId, traceId } = getRequestIds(request.headers);
  const txnHash = request.headers.get("x-aptos-txn-hash");
  const simulatedError = request.headers.get("x-aptos-error");
  const receiver = process.env.PAYMENT_RECEIVER;
  const nodeUrl =
    process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";

  if (!receiver) {
    const event = buildEvent({
      eventType: "payment_failed",
      endpoint,
      status: 500,
      amount: amountApt,
      currency: "APT",
      requestId,
      traceId,
      error: {
        code: "missing_receiver",
        category: "rpc_error",
        message: "PAYMENT_RECEIVER not set"
      }
    });
    addEvent(event);
    return NextResponse.json(
      { error: "payment_config_missing", request_id: requestId, trace_id: traceId },
      { status: 500 }
    );
  }

  if (simulatedError) {
    const event = buildEvent({
      eventType: "payment_failed",
      endpoint,
      status: 403,
      amount: amountApt,
      currency: "APT",
      requestId,
      traceId,
      error: {
        code: simulatedError,
        category: "insufficient_balance",
        message: "Insufficient balance to pay"
      },
      metadata: { reason: simulatedError }
    });
    addEvent(event);
    return NextResponse.json(
      { error: "payment_verification_failed", request_id: requestId, trace_id: traceId },
      { status: 403 }
    );
  }

  if (!txnHash) {
    const event = buildEvent({
      eventType: "payment_required",
      endpoint,
      status: 402,
      amount: amountApt,
      currency: "APT",
      requestId,
      traceId,
      metadata: { reason: "missing_txn_hash" }
    });
    addEvent(event);
    return NextResponse.json(
      {
        error: "payment_required",
        amount: amountApt,
        currency: "APT",
        receiver,
        request_id: requestId,
        trace_id: traceId
      },
      { status: 402 }
    );
  }

  try {
    const result = await verifyAptosTransfer({
      txnHash,
      receiver,
      amountApt,
      nodeUrl
    });

    if (!result.ok) {
      const event = buildEvent({
        eventType: "payment_failed",
        endpoint,
        status: 403,
        amount: amountApt,
        currency: "APT",
        requestId,
        traceId,
        payer: result.payer,
        error: {
          code: result.reason || "verification_failed",
          category: "signature_failure",
          message: result.reason || "Payment verification failed"
        },
        metadata: { reason: result.reason }
      });
      addEvent(event);
      return NextResponse.json(
        { error: "payment_verification_failed", request_id: requestId, trace_id: traceId },
        { status: 403 }
      );
    }

    return {
      requestId,
      traceId,
      payer: result.payer,
      metadata: result.metadata
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "verification_error";
    const event = buildEvent({
      eventType: "payment_failed",
      endpoint,
      status: 500,
      amount: amountApt,
      currency: "APT",
      requestId,
      traceId,
      error: {
        code: "rpc_error",
        category: "rpc_error",
        message
      }
    });
    addEvent(event);
    return NextResponse.json(
      { error: "payment_verification_failed", request_id: requestId, trace_id: traceId },
      { status: 500 }
    );
  }
}
