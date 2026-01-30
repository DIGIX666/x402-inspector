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


## Builders
- [Thox](https://github.com/thox)
- [Kazai777](https://github.com/kazai777)

## Hackathon 
![x402-hackathon-APTOS](image.png)