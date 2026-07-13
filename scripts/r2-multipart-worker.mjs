const KEY_PREFIX = 'apps/bdfz-companion/';
const SOURCE_PREFIX = '/ieduer/bdfz-companion/release-assets-v';
const PART_BYTES = 8 * 1024 * 1024;
const MAX_SOURCE_BYTES = 64 * 1024 * 1024;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function isValidKey(key) {
  return typeof key === 'string'
    && key.startsWith(KEY_PREFIX)
    && key.length <= 512
    && !key.includes('..')
    && /^[A-Za-z0-9._/-]+$/.test(key);
}

function isAuthorized(request, env) {
  if (typeof env.UPLOAD_TOKEN !== 'string' || env.UPLOAD_TOKEN.length !== 64) {
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${env.UPLOAD_TOKEN}`;
}

function isValidSourceUrl(source) {
  if (typeof source !== 'string' || source.length > 1024) {
    return false;
  }
  try {
    const url = new URL(source);
    return url.protocol === 'https:'
      && url.hostname === 'raw.githubusercontent.com'
      && url.search === ''
      && url.hash === ''
      && url.pathname.startsWith(SOURCE_PREFIX)
      && /^\/ieduer\/bdfz-companion\/release-assets-v[0-9]+\.[0-9]+\.[0-9]+-[0-9]+\/artifacts\/[A-Za-z0-9._-]+\.apk$/.test(url.pathname);
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({
        ok: true,
        ready: typeof env.UPLOAD_TOKEN === 'string',
        authorized: isAuthorized(request, env),
        tokenLength: typeof env.UPLOAD_TOKEN === 'string' ? env.UPLOAD_TOKEN.length : 0,
      });
    }

    if (!isAuthorized(request, env)) {
      return json({ error: 'unauthorized' }, 401);
    }
    if (url.pathname !== '/import' || request.method !== 'POST') {
      return json({ error: 'not found' }, 404);
    }

    const body = await request.json().catch(() => null);
    const key = body?.key;
    const contentType = body?.contentType;
    const source = body?.source;
    if (!isValidKey(key) || typeof contentType !== 'string' || contentType.length > 128 || !isValidSourceUrl(source)) {
      return json({ error: 'invalid import metadata' }, 400);
    }

    const response = await fetch(source, {
      redirect: 'follow',
      headers: { 'user-agent': 'bdfz-companion-release-import/1.0' },
    });
    if (!response.ok) {
      return json({ error: `source returned ${response.status}` }, 502);
    }
    const data = await response.arrayBuffer();
    if (data.byteLength < 1 || data.byteLength > MAX_SOURCE_BYTES) {
      return json({ error: 'source has invalid size' }, 502);
    }

    const upload = await env.BUCKET.createMultipartUpload(key, {
      httpMetadata: { contentType },
    });
    const parts = [];
    try {
      for (let offset = 0, partNumber = 1; offset < data.byteLength; offset += PART_BYTES, partNumber += 1) {
        const partData = data.slice(offset, Math.min(offset + PART_BYTES, data.byteLength));
        parts.push(await upload.uploadPart(partNumber, partData));
      }
      const object = await upload.complete(parts);
      return json({ key: object.key, size: object.size, importedSize: data.byteLength, etag: object.etag });
    } catch (error) {
      await upload.abort().catch(() => undefined);
      return json({ error: error instanceof Error ? error.message : 'import failed' }, 502);
    }
  },
};
