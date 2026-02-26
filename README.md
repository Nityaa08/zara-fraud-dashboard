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

- **Multi-dimensional filtering**: Country, payment method, status, amount range, date range
- **4 interactive charts**: Time series, country distribution, payment method, amount histogram
- **Chart-click filtering**: Click a chart segment to filter the entire dashboard
- **Sortable transaction table** with pagination
- **Slide-out detail panel** with fraud indicators (IP mismatch highlighting)
- **Summary stats bar** showing chargebacks, rates, and IP mismatches

## Embedded Fraud Pattern

50 high-value chargebacks ($400–$900) from Brazil via credit card, all in a 2-hour window (Feb 24, 02:00–04:00 UTC), targeting electronics. IP addresses originate from Nigeria, Russia, and China — a clear billing/IP country mismatch. These are visually obvious as a spike in the time series chart and flagged with red highlighting in the table.
