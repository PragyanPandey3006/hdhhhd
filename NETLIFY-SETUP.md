# Silent Router — Netlify manual deployment + Telegram tracking

## Important: use Netlify CLI for this ZIP

Netlify Drop is suitable for publishing the static `dist` folder, but this project also needs a serverless function. Deploy from your computer with Netlify CLI so the function is uploaded too.

## 1. Prepare the project

1. Extract this ZIP.
2. Open a terminal in the `quycan-main` folder (the folder containing `package.json` and `netlify.toml`).
3. Run:

```bash
npm install
npm run build
npm install -g netlify-cli
netlify login
netlify init --manual
```

When prompted, create a new site or link the existing Silent Router site.

## 2. Add secrets in Netlify

In Netlify dashboard open: **Site configuration → Environment variables → Add a variable**. Add:

- `TELEGRAM_BOT_TOKEN` = your newly regenerated Telegram bot token
- `TELEGRAM_CHAT_ID` = your private numeric Telegram chat/user ID

Set the variables for the **Functions** runtime / all deploy contexts. Do not add either value to `.env`, source code, `VITE_` variables, or Git.

Open your bot in Telegram and press **Start** once. For a private chat, the chat ID is normally the same numeric ID returned by `@userinfobot`.

## 3. Deploy the site and function

From the project folder run:

```bash
netlify deploy --prod --dir=dist --functions=netlify/functions
```

The `netlify.toml` also declares the publish and functions folders. CLI deploy uploads the static files and serverless functions. A plain drag-and-drop of `dist` does not upload this function.

## 4. Test

Open the live site in a private/incognito window. A `Page visit` message should arrive in your Telegram. Navigate to Company, Divisions, Platform, etc. to test section notifications. Click the contact and partnership links to test inquiry notifications.

The endpoint is `https://YOUR-SITE.netlify.app/api/track` (POST only). Opening it in a browser sends GET and should return HTTP 405; that is expected.

## Events captured

- Page visits and in-page section navigation
- Contact and partnership link clicks (these indicate intent, not proof an email was sent)
- Coarse device class, browser, operating system, language and screen resolution
- Referrer and event timestamp

No precise GPS location, IP address, health information, or form contents are intentionally collected. Add a clear privacy/cookie notice to the public website and update your privacy policy to disclose this analytics/Telegram notification processing.
