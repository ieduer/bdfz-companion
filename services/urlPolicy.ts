const TRUSTED_WEB_ROOTS = ['bdfz.net', 'rdfzer.com', 'rdfz.net'] as const;
const SESSION_BRIDGE_HOSTS = new Set(['my.bdfz.net', 'uc.bdfz.net']);
const EXTERNAL_ONLY_URLS = new Set(['http://bdfz-cinema.bdfz.net:8765/']);

function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return null;
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) return null;
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.hostname !== parsed.hostname.toLowerCase() || parsed.hostname.endsWith('.')) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isTrustedHostname(hostname: string): boolean {
  return TRUSTED_WEB_ROOTS.some((root) => hostname === root || hostname.endsWith(`.${root}`));
}

export function getTrustedWebViewUrl(value: unknown): string | null {
  const parsed = parseHttpUrl(value);
  if (!parsed || parsed.protocol !== 'https:' || !isTrustedHostname(parsed.hostname)) return null;
  if (parsed.port && parsed.port !== '443') return null;
  return parsed.href;
}

export function isTrustedWebViewUrl(value: unknown): boolean {
  return getTrustedWebViewUrl(value) !== null;
}

export function isTrustedSessionBridgeUrl(value: unknown): boolean {
  const parsed = parseHttpUrl(value);
  return Boolean(
    parsed
    && parsed.protocol === 'https:'
    && (!parsed.port || parsed.port === '443')
    && SESSION_BRIDGE_HOSTS.has(parsed.hostname)
  );
}

export function isExternalOnlyUrl(value: unknown): boolean {
  const parsed = parseHttpUrl(value);
  return Boolean(parsed && EXTERNAL_ONLY_URLS.has(parsed.href));
}

export function getSafeExternalNavigationUrl(value: unknown): string | null {
  const parsed = parseHttpUrl(value);
  if (!parsed) return null;
  if (EXTERNAL_ONLY_URLS.has(parsed.href)) return parsed.href;
  if (parsed.protocol !== 'https:' || (parsed.port && parsed.port !== '443')) return null;
  return parsed.href;
}
