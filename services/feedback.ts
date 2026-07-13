import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { deleteToken, getToken, isValidSessionToken } from '@/services/auth';

export type FeedbackCategory = 'bug' | 'content' | 'account' | 'ui' | 'idea' | 'other';
export type FeedbackSeverity = 'low' | 'normal' | 'high' | 'urgent';

export interface AppFeedbackInput {
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  reporterContact?: string;
}

export interface AppFeedbackResult {
  feedbackId: string;
  stored: boolean;
  notification: {
    channel: 'telegram';
    sent: boolean;
  };
}

export class FeedbackRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FeedbackRequestError';
  }
}

export async function submitAppFeedback(input: AppFeedbackInput): Promise<AppFeedbackResult> {
  const token = await getToken();
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
  if (isValidSessionToken(token)) {
    headers.set('Cookie', `bdfz_uc_session=${token}`);
  }

  const response = await fetch('https://my.bdfz.net/api/feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      siteKey: 'bdfz-companion',
      siteTitle: 'BDFZ App',
      pageUrl: 'bdfzcompanion://feedback',
      pageTitle: 'BDFZ App 用戶反饋',
      category: input.category,
      severity: input.severity,
      title: input.title.trim(),
      description: input.description.trim(),
      reporterContact: input.reporterContact?.trim() || '',
      clientContext: {
        appVersion: Constants.expoConfig?.version || 'unknown',
        platform: Platform.OS,
        platformVersion: String(Platform.Version),
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      await deleteToken();
    }
    throw new FeedbackRequestError(
      typeof payload?.error === 'string' ? payload.error : `Feedback request failed: ${response.status}`,
      response.status,
    );
  }

  return payload as AppFeedbackResult;
}
