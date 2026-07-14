import assert from 'node:assert/strict';
import {
  APP_UPDATE_APK_URL,
  compareAppVersions,
  isAppUpdateAvailable,
  parseAppUpdateMetadata,
} from '../services/appUpdatePolicy.ts';

const rawMetadata = {
  version: '1.1.0',
  versionCode: 2,
  abi: 'arm64-v8a',
  sha256: 'a'.repeat(64),
  releasedAt: '2026-07-13T12:00:00Z',
  downloadUrl: APP_UPDATE_APK_URL,
};
const latest = parseAppUpdateMetadata(rawMetadata);

assert.ok(latest);
assert.equal(compareAppVersions('1.10.0', '1.9.9'), 1);
assert.equal(compareAppVersions('1.1.0', '1.1.0'), 0);
assert.equal(compareAppVersions('1.0.9', '1.1.0'), -1);
assert.equal(isAppUpdateAvailable({ version: '1.0.0', buildNumber: 1 }, latest), true);
assert.equal(isAppUpdateAvailable({ version: '1.1.0', buildNumber: 1 }, latest), true);
assert.equal(isAppUpdateAvailable({ version: '1.1.0', buildNumber: 2 }, latest), false);
assert.equal(isAppUpdateAvailable({ version: '1.2.0', buildNumber: 3 }, latest), false);
assert.equal(parseAppUpdateMetadata({ ...rawMetadata, version: '1.1' }), null);
assert.equal(parseAppUpdateMetadata({ ...rawMetadata, version: '999999999999999999999.1.0' }), null);
assert.equal(parseAppUpdateMetadata({ ...rawMetadata, versionCode: 0 }), null);
assert.equal(parseAppUpdateMetadata({ ...rawMetadata, sha256: 'not-a-sha' }), null);
assert.equal(parseAppUpdateMetadata({ ...rawMetadata, downloadUrl: 'https://evil.example/latest.apk' }), null);
assert.throws(() => compareAppVersions('latest', '1.0.0'), /Invalid application version/);

console.log('App update policy checks passed');
