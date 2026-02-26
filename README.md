# Transaction Pattern Explorer — Zara eShop

A frontend-only fraud analytics dashboard that helps risk analysts visually identify fraud patterns from suspicious transactions.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Regenerate Test Data

```bash
node scripts/generate-data.js
```

This generates 900 transactions in `public/transactions.json` with an embedded fraud pattern.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new).

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- date-fns

## Features

- **Multi-dimensional filtering**: Country, payment method, status, amount range, date range, text search, high-risk toggle
- **4 interactive charts**: Time series, country distribution, payment method, amount histogram
- **Chart-click filtering**: Click any chart segment to filter the entire dashboard instantly
- **Suspicious Patterns Panel**: Auto-detects chargeback clusters, IP mismatches, email velocity, high-amount outliers
- **Risk scoring**: Each transaction gets a 0–100 risk score based on fraud indicators
- **Sortable transaction table** with pagination, risk indicators, and CSV export
- **Slide-out detail panel** with full transaction info, IP mismatch alerts, and related transactions
- **Summary stats bar** showing chargebacks, rates, and IP mismatches

## Embedded Fraud Pattern

50 high-value chargebacks ($400–$780) from Brazil via Visa, all in a 2-hour window (Feb 24, 02:00–04:00 UTC), targeting Electronics. IP addresses originate from Nigeria, Russia, and China — a clear billing/IP country mismatch. Transactions use clustered card numbers (70xx range) and repeat from 5 suspicious email addresses. This pattern is discoverable within 2-3 minutes by observing the time series spike, filtering by chargebacks, or using the High Risk toggle.
