
const allowedEvents = new Set([
  'page_view',
  'section_view',
  'contact_click',
  'partnership_click',
  'inquiry_click',
]);

const clean = (value: unknown, max = 500): string =>
  typeof value === 'string'
    ? value.replace(/[\r\n<>]/g, ' ').trim().slice(0, max)
    : '';

export default async (request: Request): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...headers, Allow: 'POST' } }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Tracking not configured' }),
      { status: 503, headers }
    );
  }

  let body: Record<string, unknown>;

  try {
    const raw = await request.text();

    if (raw.length > 8000) {
      return new Response('Payload too large', { status: 413 });
    }

    body = JSON.parse(raw);
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'Invalid JSON' }),
      { status: 400, headers }
    );
  }

  const event = clean(body.event, 40);

  if (!allowedEvents.has(event)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Unsupported event' }),
      { status: 400, headers }
    );
  }

  // Prefer the User-Agent received directly by Netlify.
  const userAgent = clean(
    request.headers.get('user-agent') || body.userAgent,
    600
  ) || 'Unknown';

  // Client hints are browser-dependent.
  const clientHintModel = clean(
    request.headers.get('sec-ch-ua-model'),
    100
  );

  const model = clientHintModel ||
    clean(body.model, 120) ||
    'Not available';

  const page = clean(body.page, 180) || '/';
  const referrer = clean(body.referrer, 250) || 'Direct';
  const device = clean(body.device, 60) || 'Unknown';
  const browser = clean(body.browser, 80) || 'Unknown';
  const browserVersion = clean(body.browserVersion, 40) || 'Unknown';
  const os = clean(body.os, 80) || 'Unknown';
  const platformVersion = clean(body.platformVersion, 40) || 'Unknown';
  const language = clean(body.language, 30) || 'Unknown';
  const screen = clean(body.screen, 40) || 'Unknown';
  const timestamp = clean(body.timestamp, 50) ||
    new Date().toISOString();

  const labels: Record<string, string> = {
    page_view: 'Page visit',
    section_view: 'Section navigation',
    contact_click: 'Contact click',
    partnership_click: 'Partnership click',
    inquiry_click: 'Inquiry click',
  };

  const message = [
    '🔔 SILENT ROUTER — WEBSITE ACTIVITY',
    '',
    `Activity: ${labels[event]}`,
    `Page: ${page}`,
    `Referrer: ${referrer}`,
    '',
    '📱 VISITOR DEVICE INFORMATION',
    `Device type: ${device}`,
    `Device model: ${model}`,
    `Browser: ${browser}`,
    `Browser version: ${browserVersion}`,
    `Operating system: ${os}`,
    `OS version: ${platformVersion}`,
    `Language: ${language}`,
    `Screen resolution: ${screen}`,
    '',
    '🌐 FULL USER-AGENT',
    userAgent,
    '',
    `🕒 Time: ${timestamp}`,
  ].join('\n');

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        }),
      }
    );

    if (!telegramResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Telegram delivery failed',
        }),
        { status: 502, headers }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Telegram unavailable',
      }),
      { status: 502, headers }
    );
  }
};
