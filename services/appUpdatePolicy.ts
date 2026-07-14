export const APP_UPDATE_METADATA_URL = 'https://img.bdfz.net/apps/bdfz-companion/latest.json';
export const APP_UPDATE_APK_URL = 'https://img.bdfz.net/apps/bdfz-companion/latest.apk';

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export type InstalledAppVersion = {
  version: string;
  buildNumber: number;
};

export type AppUpdateMetadata = {
  version: string;
  versionCode: number;
  abi: 'arm64-v8a';
  sha256: string;
  releasedAt: string;
  downloadUrl: typeof APP_UPDATE_APK_URL;
};

function parseVersion(version: unknown): [number, number, number] | null {
  if (typeof version !== 'string') return null;
  const match = VERSION_PATTERN.exec(version);
  if (!match) return null;
  const parts = [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
  return parts.every(Number.isSafeInteger) ? parts : null;
}

export function isValidAppVersion(version: unknown): version is string {
  return parseVersion(version) !== null;
}

export function compareAppVersions(left: string, right: string): number {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  if (!leftParts || !rightParts) throw new Error('Invalid application version');

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1;
    }
  }
  return 0;
}

export function parseAppUpdateMetadata(value: unknown): AppUpdateMetadata | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const metadata = value as Record<string, unknown>;
  if (!isValidAppVersion(metadata.version)) return null;
  if (!Number.isSafeInteger(metadata.versionCode) || Number(metadata.versionCode) < 1) return null;
  if (metadata.abi !== 'arm64-v8a') return null;
  if (typeof metadata.sha256 !== 'string' || !SHA256_PATTERN.test(metadata.sha256)) return null;
  if (typeof metadata.releasedAt !== 'string' || Number.isNaN(Date.parse(metadata.releasedAt))) return null;
  if (metadata.downloadUrl !== APP_UPDATE_APK_URL) return null;

  return {
    version: metadata.version,
    versionCode: Number(metadata.versionCode),
    abi: metadata.abi,
    sha256: metadata.sha256,
    releasedAt: metadata.releasedAt,
    downloadUrl: APP_UPDATE_APK_URL,
  };
}

export function isAppUpdateAvailable(
  installed: InstalledAppVersion,
  latest: AppUpdateMetadata,
): boolean {
  const versionComparison = compareAppVersions(latest.version, installed.version);
  return versionComparison > 0
    || (versionComparison === 0 && latest.versionCode > installed.buildNumber);
}
