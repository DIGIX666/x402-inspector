import { Account, Aptos, AptosConfig, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const apiUrl = process.env.DEMO_API_URL || "http://localhost:3000/api/premium-data";
const privateKeyHex = process.env.APTOS_PRIVATE_KEY;
const receiver = process.env.PAYMENT_RECEIVER;
const nodeUrl = process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";
const amountApt = Number(process.env.APTOS_AMOUNT || "0.1");

if (!privateKeyHex) {
  console.error("Missing APTOS_PRIVATE_KEY in env.");
  process.exit(1);
}

const privateKeyHexValue = privateKeyHex;

if (!receiver) {
  console.error("Missing PAYMENT_RECEIVER in env.");
  process.exit(1);
}

if (!Number.isFinite(amountApt) || amountApt <= 0) {
  console.error("Invalid APTOS_AMOUNT.");
  process.exit(1);
}

async function main() {
  const config = new AptosConfig({ fullnode: nodeUrl });
  const aptos = new Aptos(config);
  const privateKey = new Ed25519PrivateKey(
    privateKeyHexValue.startsWith("0x") ? privateKeyHexValue.slice(2) : privateKeyHexValue
  );
  const sender = Account.fromPrivateKey({ privateKey });

  const amountOctas = Math.round(amountApt * 1e8);
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [receiver, amountOctas]
      }
    });

    const committed = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction
    });
    await aptos.waitForTransaction({ transactionHash: committed.hash });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-aptos-txn-hash": committed.hash
      }
    });

    const data = await response.json();
    console.log("TX:", committed.hash);
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "transaction_failed";
    const reason = message.includes("EINSUFFICIENT_BALANCE")
      ? "insufficient_balance"
      : "transaction_failed";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-aptos-error": reason
      }
    });

    const data = await response.json();
    console.log("TX failed:", message);
    console.log("Status:", response.status);
    console.log("Data:", data);
  }
}

main().catch((err) => {
  console.error("Buyer demo failed:", err?.message || err);
  process.exit(1);
});
