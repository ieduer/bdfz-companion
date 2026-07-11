import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 配置通知顯示處理器（App 處於前台時是否彈出通知）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 註冊推送通知，獲取原生設備 Push Token (FCM / APNs)
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  let token: string | null = null;

  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions denied!');
        return null;
      }

      // 獲取設備原生 Push Token
      const tokenData = await Notifications.getDevicePushTokenAsync();
      token = tokenData.data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Android 特定的通知通道配置
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0284c7',
      });
    }
  } catch (error) {
    console.error('Failed to register for push notifications', error);
  }

  return token;
}
