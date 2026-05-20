# Carry — Monthly Issue Review

ระบบติดตามและรีวิวปัญหาประจำเดือน พร้อม Tinder-style swipe interface

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Variables (global stylesheet) + Tailwind CSS
- **State**: React useReducer (local — Supabase coming next)
- **Deploy**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Entry point
│   └── globals.css      # All styles (migrated from styles.css)
├── components/
│   ├── AppShell.tsx     # Main shell, state, routing
│   ├── layout/
│   │   └── Sidebar.tsx
│   ├── screens/
│   │   ├── Dashboard.tsx
│   │   ├── AddIssue.tsx
│   │   ├── GroupsView.tsx
│   │   ├── Summary.tsx
│   │   └── History.tsx
│   ├── swipe/
│   │   └── SwipeDeck.tsx  # Tinder-style swipe (mouse + touch + keyboard)
│   └── ui/
│       └── PhotoTile.tsx
├── lib/
│   ├── reducer.ts       # App state reducer
│   ├── seed.ts          # Demo data
│   └── utils.ts         # monthLabel, prevMonth, etc.
└── types/
    └── index.ts         # All TypeScript types
```

## Roadmap

- [ ] Step 2: Supabase schema + database integration
- [ ] Step 3: Supabase Auth (Admin / Member roles)
- [ ] Step 4: Real image upload via Supabase Storage
- [ ] Step 5: URL-based routing (Next.js App Router pages)
- [ ] Step 6: Full mobile responsive polish

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect this repo to [vercel.com](https://vercel.com) for auto-deploy on push.
