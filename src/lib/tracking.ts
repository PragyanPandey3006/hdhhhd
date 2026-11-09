
export type TrackingEvent =
  | 'page_view'
  | 'section_view'
  | 'contact_click'
  | 'partnership_click'
  | 'inquiry_click';

type UserAgentData = {
  model?: string;
  platform?: string;
  platformVersion?: string;
  fullVersionList?: Array<{ brand: string; version: string }>;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    model?: string;
    platform?: string;
    platformVersion?: string;
    fullVersionList?: Array<{ brand: string; version: string }>;
  }>;
};

function detectDeviceModel(ua: string): string {
  // Android devices sometimes expose their model in the User-Agent.
  const android = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i);

  if (android?.[1]) {
    const model = android[1].trim();
    if (!/^(wv|linux|arm|mobile|tablet|compatible)$/i.test(model)) {
      return model;
    }
  }

  if (/iPhone/i.test(ua)) return 'iPhone (exact model unavailable)';
  if (/iPad/i.test(ua)) return 'iPad (exact model unavailable)';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux device';

  return 'Unknown';
}

async function getDeviceDetails() {
  const ua = navigator.userAgent || 'Unknown';

  let model = detectDeviceModel(ua);
  let platform = '';
  let platformVersion = '';
  let browserVersion = '';

  // Request additional device information where browser support permits.
  const nav = navigator as Navigator & {
    userAgentData?: UserAgentData;
  };

  try {
    const uaData = nav.userAgentData;

    if (uaData?.getHighEntropyValues) {
      const details = await uaData.getHighEntropyValues([
        'model',
        'platform',
        'platformVersion',
        'fullVersionList',
      ]);

      if (details.model) model = details.model;
      platform = details.platform || '';
      platformVersion = details.platformVersion || '';

      const brands = details.fullVersionList || [];
      const preferred = brands.find(
        item => !/Not.?A.?Brand/i.test(item.brand)
      );

      if (preferred) browserVersion = preferred.version;
    }
  } catch {
    // Some browsers restrict high-entropy device information.
  }

  const device = /iPad|Tablet/i.test(ua)
    ? 'Tablet'
    : /Mobi|Android|iPhone/i.test(ua)
      ? 'Mobile'
      : 'Desktop';

  const browser = /Edg\//.test(ua)
    ? 'Microsoft Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Other';

  const os = platform || (
    /Windows/i.test(ua) ? 'Windows'
      : /Android/i.test(ua) ? 'Android'
      : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
      : /Mac OS/i.test(ua) ? 'macOS'
      : /Linux/i.test(ua) ? 'Linux'
      : 'Other'
  );

  return {
    device,
    model,
    browser,
    browserVersion,
    os,
    platformVersion,
    userAgent: ua,
    language: navigator.language || 'Unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
  };
}

export async function trackEvent(
  event: TrackingEvent,
  pageOverride?: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const deviceDetails = await getDeviceDetails();

    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        event,
        page: pageOverride ||
          `${window.location.pathname}${window.location.hash}`,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toISOString(),
        ...deviceDetails,
      }),
    });
  } catch {
    // Tracking must never interrupt the visitor experience.
  }
}
