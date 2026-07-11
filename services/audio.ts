import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

/**
 * 請求麥克風權限
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * 開始高品質音頻錄製
 */
export async function startRecording(): Promise<void> {
  try {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    // 設定音頻模式以支援錄音，並在 iOS 靜音模式下依然能播放
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // 卸載之前的錄音對象（防禦性代碼）
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }

    // 創建高品質錄音 (通常為 AAC / M4A 格式)
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
  } catch (err) {
    console.error('Failed to start recording', err);
    throw err;
  }
}

/**
 * 停止錄音並返回本地錄音檔案 URI
 */
export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    return uri; // 返回本地臨時檔案路徑 (e.g., file:///.../recording-xxx.m4a)
  } catch (err) {
    console.error('Failed to stop recording', err);
    return null;
  }
}

/**
 * 獲取當前錄音狀態
 */
export function isRecordingActive(): boolean {
  return recording !== null;
}
