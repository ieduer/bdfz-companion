/**
 * Audio recording service — STUB
 *
 * expo-av is currently incompatible with React Native 0.86.0 due to a JSI
 * ABI change (IRuntime vs Runtime). This stub preserves the public API so
 * the rest of the codebase compiles. Re-enable once expo-av ships a
 * compatible build.
 *
 * Tracked issue: libexpo-av.so references _ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE
 * which was renamed to …IRuntimeE in RN 0.86.
 */

export async function requestMicrophonePermission(): Promise<boolean> {
  console.warn('[audio] expo-av unavailable — microphone permission stubbed');
  return false;
}

export async function startRecording(): Promise<void> {
  throw new Error('[audio] expo-av unavailable on this build');
}

export async function stopRecording(): Promise<string | null> {
  return null;
}

export function isRecordingActive(): boolean {
  return false;
}
