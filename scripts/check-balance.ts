import { Account, Aptos, AptosConfig, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const privateKeyHex = process.env.APTOS_PRIVATE_KEY;
const nodeUrl = process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";

if (!privateKeyHex) {
  console.error("Missing APTOS_PRIVATE_KEY in env.");
  process.exit(1);
}

async function main() {
  const config = new AptosConfig({ fullnode: nodeUrl });
  const aptos = new Aptos(config);
  const privateKey = new Ed25519PrivateKey(
    privateKeyHex.startsWith("0x") ? privateKeyHex.slice(2) : privateKeyHex
  );
  const account = Account.fromPrivateKey({ privateKey });
  const address = account.accountAddress.toString();

  const balance = await aptos.getAccountAPTAmount({ accountAddress: address });
  console.log("Address:", address);
  console.log("Balance (octas):", balance);
  console.log("Balance (APT):", Number(balance) / 1e8);
}

main().catch((err) => {
  console.error("Balance check failed:", err?.message || err);
  process.exit(1);
});
