# PrintDenture

Fresh Next.js app for the PrintDenture product (separate from PrintCrown).

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Deploy (Vercel)

Create a **new** Vercel project linked to this repo. Use `NEXT_PUBLIC_APP_URL=https://your-printdenture-domain` in Vercel env vars (not PrintCrown URLs).
