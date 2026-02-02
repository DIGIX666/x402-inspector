# x402-inspector

## Project Summary
x402 Inspector is a real-time observability + analytics SDK that makes Aptos x402 payment flows easy to monitor, debug, and understand in production. It plugs into any x402-protected API via middleware hooks and emits structured events for dashboards and metrics. First dedicated x402 observability tool focused on Aptos developers.

## Why ?
x402 integrations are currently opaque: errors are hard to diagnose, success rates and revenue are hard to measure, and debugging relies on raw logs. x402 Inspector provides structured events, a live dashboard, and basic analytics out of the box.

## Hackathon Fit
- Track: Infrastructure & Dev Tools -> Payment analytics and dashboards
- Clear pain: every x402 API needs visibility and debugging
- Demoable: live dashboard with real-time events

## POC Scope
1. Transaction Viewer
   - Payments list: endpoint, amount, status, timestamp, payer (anonymized)

2. Error Dashboard
   - Categories: insufficient balance, signature failure, pricing mismatch, RPC/network
   - Counts + last occurrences

3. Real-time Monitoring
   - Live feed (polling or WebSocket/SSE)
   - Auto-refresh + new event highlighting

4. Simple Analytics
   - Success rate
   - Total volume + total revenue
   - Volume by endpoint
   - Time-series activity chart

## Architecture
Design goals: non-invasive integration, low overhead, production-friendly structured events, extensible storage adapter.

```text
┌────────────────────┐
│  Client / Consumer │
└─────────┬──────────┘
          │ HTTP request
          ▼
┌───────────────────────────┐
│  x402-Protected API Server│
│  (Next.js / Express)      │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  aptos-x402 Middleware    │
│  - returns 402 when needed│
│  - verifies payments      │
└─────────┬─────────────────┘
          │ hooks / events
          ▼
┌───────────────────────────┐
│  x402 Inspector Logger    │
│  - captures success/fail  │
│  - normalizes event shape │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Event Store (MVP)        │
│  - SQLite or in-memory    │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Analytics API            │
│  - /events                │
│  - /stats                 │
│  - /errors                │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Dashboard UI (Next.js)   │
│  - transactions table     │
│  - error panel            │
│  - charts                 │
│  - realtime feed          │
└───────────────────────────┘
```

## Prerequisites
[link](https://aptos.dev/)
- Aptos Wallet: Petra Web installed
- Aptos Testnet access
- Dev environment: Node.js + TypeScript
- Basic x402 protocol knowledge

## Quick POC (Next.js + APT payments)
This POC runs a minimal API protected by APT transfer verification, an in-memory
event store, and a simple dashboard at `/`. Payments are fixed at **0.01 APT**
per request.

## Demo
![x402-inspector-demo](/imageReadme/demo.png)

[Demo video (local)](https://youtu.be/vr8kamnGNw0)

Example failure reasons shown in the dashboard:
- `insufficient_balance` (not enough APT to pay)
- `amount_or_recipient_mismatch` (wrong amount or receiver)

Note: any private key used in the demo is test-only and empty.

### Setup
```bash
npm install
```

### Environment
Create `.env.local`:

```bash
PAYMENT_RECEIVER=0xYOUR_WALLET
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
```

### Run (dev)
```bash
npm run dev
```

Open the dashboard:
```
http://localhost:3000/
```

Trigger a 402 (no payment):
```bash
curl -X POST "http://localhost:3000/api/premium-data"
```

Test with payment (auto-send APT on testnet, fixed at 0.01 APT):
```bash
export APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export PAYMENT_RECEIVER=0xYOUR_WALLET
export APTOS_AMOUNT=0.01
npm run demo:buyer
```

### Buyer demo script
```bash
export APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export PAYMENT_RECEIVER=0xYOUR_WALLET
export APTOS_AMOUNT=0.01
export DEMO_API_URL=http://localhost:3000/api/premium-data
npm run demo:buyer
```
---
### Buyer failure demo script
```bash
export APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export PAYMENT_RECEIVER=0xYOUR_WALLET
export APTOS_AMOUNT=1
export DEMO_API_URL=http://localhost:3000/api/premium-data
npm run demo:buyer
```
### output
```
if insufficient balance, you'll see an error like:
{
  "error": "Payment failed: insufficient_balance"
}
--
if amount mismatch, you'll see an error like:
{
  "error": "Payment failed: amount_or_recipient_mismatch"
}
```
---
### Check balance
```bash
export APTOS_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
npm run check:balance
```

### Build + run (prod)
```bash
npm run build
npm run start
```


## Builders
- [Thox](https://github.com/thox)

## Hackathon 
![x402-hackathon-APTOS](/imageReadme/image.png)
