# Silent Router — AI Health Research & Intelligence Network

Corporate website for Silent Router, the AI healthcare, biomedical research and education brand of Cogmatic Technologies Private Limited.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment

This is a Vite + React + TypeScript static frontend. Deploy the generated `dist/` directory to Vercel, Netlify, Cloudflare Pages, or any static web host. Configure SPA fallback to `/index.html` if deep links are added later.

## Security

Do not place Telegram bot tokens, API keys, patient data, or other secrets in frontend code or public environment variables. Store backend credentials in server-side environment variables and rotate any credential that has been exposed.

## Important positioning note

The site describes research directions and intended platform capabilities. It does not claim clinical efficacy, provide medical advice, or represent a validated diagnostic or treatment product. Scientific outputs require qualified human review and independent validation.

## Telegram website tracking

Page views and contact/partnership CTA clicks are forwarded by `/api/track` to your Telegram chat. The bot token is server-side only.

1. Revoke the bot token previously pasted into chat and generate a fresh token with BotFather.
2. Open a chat with your bot and send `/start`. Obtain your numeric chat ID from the bot updates (or a trusted Telegram ID utility).
3. Deploy to Vercel and set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Project Settings → Environment Variables.
4. Redeploy and visit the site to test a page-view notification.

Never use a `VITE_` prefix for the token. For local serverless testing, install Vercel CLI and run `vercel dev`.
