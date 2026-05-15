# We Commerce — Frontend

A multi-vendor marketplace web app built with **Next.js 16 + TypeScript + Tailwind v4**.

> Backend repo: https://github.com/Hen-Heang/we-commerce-api

---

## Quick start

```bash
# 1. install deps
npm install

# 2. start backend first (separate terminal, port 8080)
#    see ../we-commerce-api-main

# 3. run frontend
npm run dev
# → http://localhost:3000
```

The app falls back to mock data when the API is empty or unreachable, so it's demoable out of the box.

---

## What's in here

12 routes (auth, market, product detail, saved, collections, cart, checkout, orders, profile) with:

- JWT auth via Axios interceptor
- TanStack Query for server state (with optimistic updates on bookmarks)
- Zustand + persist for cart and saved payment methods
- React Hook Form + Zod for forms
- Responsive: desktop top nav + mobile bottom nav
- Simulated ABA Pay / KHQR / Card payment sheets
- Order history with status timeline

---

## Full documentation

📖 **[PROJECT_GUIDE.md](./PROJECT_GUIDE.md)** — complete walkthrough of architecture, API design, request lifecycles, data flow, and end-to-end use cases. Read this if you're picking up the project.

---

## Tech stack

| Concern | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind v4 |
| Server state | TanStack Query |
| Client state | Zustand (with persist middleware) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Icons | lucide-react |
| Toasts | sonner |

## Scripts

```bash
npm run dev     # dev server with hot reload
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```

## Environment

`.env.local` (gitignored):

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_DISABLE_MOCK=false
```

---

Built by [Hen Heang](https://github.com/Hen-Heang) — Cambodian full-stack dev based in Seoul.
