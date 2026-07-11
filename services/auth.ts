import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bdfz_uc_session';

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token to SecureStore', error);
  }
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
  return token !== null && token.length > 0;
}
