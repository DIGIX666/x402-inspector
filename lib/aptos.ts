type AptosTransaction = {
  type?: string;
  success?: boolean;
  sender?: string;
  version?: string;
  payload?: {
    arguments?: unknown[];
    args?: unknown[];
    function?: string;
  };
};

type VerifyResult = {
  ok: boolean;
  reason?: string;
  payer?: string;
  metadata?: Record<string, unknown>;
};

function parseTransferArgs(args: unknown[]) {
  if (!Array.isArray(args) || args.length < 2) return {};
  const amount = args[args.length - 1];
  const recipient = args[args.length - 2];
  return { recipient, amount };
}

export async function verifyAptosTransfer({
  txnHash,
  receiver,
  amountApt,
  nodeUrl
}: {
  txnHash: string;
  receiver: string;
  amountApt: number;
  nodeUrl: string;
}): Promise<VerifyResult> {
  const res = await fetch(`${nodeUrl}/transactions/by_hash/${txnHash}`);
  if (!res.ok) return { ok: false, reason: "txn_not_found" };

  const txn = (await res.json()) as AptosTransaction;
  if (!txn || txn.type !== "user_transaction") {
    return { ok: false, reason: "not_user_transaction" };
  }
  if (txn.success === false) {
    return { ok: false, reason: "txn_failed" };
  }

  const payload = txn.payload || {};
  const args = payload.arguments || payload.args || [];
  const { recipient, amount } = parseTransferArgs(args);
  const expected = Math.round(amountApt * 1e8);
  const amountOctas = Number(amount);
  const okRecipient =
    String(recipient || "").toLowerCase() === receiver.toLowerCase();
  const okAmount = Number.isFinite(amountOctas) && amountOctas === expected;

  if (!okRecipient || !okAmount) {
    return { ok: false, reason: "amount_or_recipient_mismatch" };
  }

  return {
    ok: true,
    payer: txn.sender,
    metadata: {
      txn_hash: txnHash,
      block_height: txn.version,
      function: payload.function
    }
  };
}
