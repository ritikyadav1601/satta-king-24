# Satta King 24 Next.js

Public Next.js frontend for `satta-king-24.com`.

This project reads from the same MongoDB database as the Satta King Fast app. It does not include a separate admin panel and does not run the A7 result sync; Satta King Fast remains responsible for updating results in the shared database.

## Local setup

```bash
npm install
npm run dev
```

Required environment variables:

- `MONGODB_URI`
- `NEXT_PUBLIC_SITE_URL=https://www.satta-king-24.com`

## Important public routes

- `/`
- `/chart`
- `/chart/result-chart-Jan-2026`
- `/chart/GALI-result-chart-Jan-2026`
- `/payment-proofs`
- `/blogs`
- `/blogs/[slug]`
- `/about-us`
- `/contact`
- `/faq`
- `/disclaimer`
- `/privacy-policy`
