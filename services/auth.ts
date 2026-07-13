import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bdfz_uc_session';

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
