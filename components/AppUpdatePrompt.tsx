import { useEffect } from 'react';
import { Alert, AppState, Platform } from 'react-native';

import { checkForAppUpdate, openLatestApk } from '@/services/appUpdate';
import type { AppUpdateCheckResult } from '@/services/appUpdate';

const AUTO_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1_000;

let automaticCheckInFlight = false;
let lastAutomaticCheckAt = 0;
let promptedRelease = '';

function startApkDownload() {
  void openLatestApk().catch(() => {
    Alert.alert('無法開啟下載', '請確認網路與系統瀏覽器狀態後再試。');
  });
}

export function showUpdateAvailablePrompt(result: AppUpdateCheckResult) {
  Alert.alert(
    '發現新版本',
    `已安裝 v${result.installed.version} (${result.installed.buildNumber})\n`
      + `最新 v${result.latest.version} (${result.latest.versionCode})\n\n`
      + '點擊後將使用系統瀏覽器從 BDFZ R2 固定鏈接下載 APK。',
    [
      { text: '稍後', style: 'cancel' },
      { text: '立即更新', onPress: startApkDownload },
    ],
  );
}

export function showUpToDatePrompt(result: AppUpdateCheckResult) {
  Alert.alert(
    '已是最新版本',
    `當前版本 v${result.installed.version} (${result.installed.buildNumber})`,
    [
      { text: '關閉', style: 'cancel' },
      { text: '重新下載', onPress: startApkDownload },
    ],
  );
}

async function runAutomaticUpdateCheck() {
  if (Platform.OS !== 'android' || automaticCheckInFlight) return;
  const now = Date.now();
  if (now - lastAutomaticCheckAt < AUTO_CHECK_INTERVAL_MS) return;

  automaticCheckInFlight = true;
  try {
    const result = await checkForAppUpdate();
    lastAutomaticCheckAt = Date.now();
    const releaseKey = `${result.latest.version}:${result.latest.versionCode}`;
    if (result.updateAvailable && promptedRelease !== releaseKey) {
      promptedRelease = releaseKey;
      showUpdateAvailablePrompt(result);
    }
  } catch {
    // Automatic checks stay silent; the manual check exposes actionable errors.
  } finally {
    automaticCheckInFlight = false;
  }
}

export default function AppUpdatePrompt() {
  useEffect(() => {
    void runAutomaticUpdateCheck();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void runAutomaticUpdateCheck();
    });
    return () => subscription.remove();
  }, []);

  return null;
}
