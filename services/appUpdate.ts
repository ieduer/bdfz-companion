import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

import {
  APP_UPDATE_APK_URL,
  APP_UPDATE_METADATA_URL,
  isAppUpdateAvailable,
  isValidAppVersion,
  parseAppUpdateMetadata,
} from '@/services/appUpdatePolicy';
import type { AppUpdateMetadata, InstalledAppVersion } from '@/services/appUpdatePolicy';

const UPDATE_CHECK_TIMEOUT_MS = 8_000;
const MAX_METADATA_LENGTH = 16_384;

export type AppUpdateCheckResult = {
  installed: InstalledAppVersion;
  latest: AppUpdateMetadata;
  updateAvailable: boolean;
};

function parseBuildNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 1) return value;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function getInstalledAppVersion(): InstalledAppVersion {
  const configVersion = Constants.expoConfig?.version;
  const version = isValidAppVersion(Application.nativeApplicationVersion)
    ? Application.nativeApplicationVersion
    : isValidAppVersion(configVersion)
      ? configVersion
      : '0.0.0';
  const nativeBuildNumber = parseBuildNumber(Application.nativeBuildVersion);
  const configBuildNumber = parseBuildNumber(Constants.expoConfig?.android?.versionCode);

  return {
    version,
    buildNumber: nativeBuildNumber ?? configBuildNumber ?? 0,
  };
}

export async function checkForAppUpdate(): Promise<AppUpdateCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS);

  try {
    const metadataUrl = `${APP_UPDATE_METADATA_URL}?check=${Date.now()}`;
    const response = await fetch(metadataUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Update metadata returned HTTP ${response.status}`);

    const body = await response.text();
    if (body.length > MAX_METADATA_LENGTH) throw new Error('Update metadata is too large');

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      throw new Error('Update metadata is not valid JSON');
    }

    const latest = parseAppUpdateMetadata(parsedBody);
    if (!latest) throw new Error('Update metadata failed validation');
    const installed = getInstalledAppVersion();

    return {
      installed,
      latest,
      updateAvailable: isAppUpdateAvailable(installed, latest),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function openLatestApk(): Promise<void> {
  await Linking.openURL(APP_UPDATE_APK_URL);
}
