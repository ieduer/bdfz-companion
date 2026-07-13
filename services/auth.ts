import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bdfz_uc_session';
const NATIVE_HANDOFF_CLIENT = 'bdfz-companion';

export function isValidSessionToken(token: unknown): token is string {
  return typeof token === 'string'
    && token.length <= 4096
    && /^[A-Za-z0-9_-]{8,}\.[a-f0-9]{64}$/.test(token);
}

export async function saveToken(token: string): Promise<void> {
  if (!isValidSessionToken(token)) throw new Error('Invalid User Center session token');
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token from SecureStore', error);
    return null;
  }
}

export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token from SecureStore', error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return isValidSessionToken(token);
}

export async function exchangeNativeSessionHandoff(code: string): Promise<{ token: string; user: any }> {
  const normalizedCode = String(code || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalizedCode)) {
    throw new Error('Invalid native session handoff');
  }

  const response = await fetch('https://my.bdfz.net/api/session/native-exchange', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ client: NATIVE_HANDOFF_CLIENT, code: normalizedCode }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !isValidSessionToken(data?.token)) {
    throw new Error(`Native session exchange failed: ${response.status}`);
  }
  return { token: data.token, user: data.user || null };
}

export async function fetchFromUserCenter(path: string, options: RequestInit = {}): Promise<any> {
  const endpoint = new URL(path, 'https://my.bdfz.net/');
  if (endpoint.origin !== 'https://my.bdfz.net' || !path.startsWith('/')) {
    throw new Error('Invalid User Center API path');
  }
  const token = await getToken();
  const headers = new Headers(options.headers || {});
  if (isValidSessionToken(token)) {
    headers.set('Cookie', `${TOKEN_KEY}=${token}`);
  }
  headers.set('Accept', 'application/json');

  const response = await fetch(endpoint.href, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      await deleteToken();
    }
    throw new Error(`User Center request failed: ${response.status}`);
  }

  return response.json();
}
