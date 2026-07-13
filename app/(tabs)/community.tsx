import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, RADIUS } from '@/constants/theme';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getSafeExternalNavigationUrl, isTrustedWebViewUrl } from '@/services/urlPolicy';

export default function CommunityScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleShouldStartLoad = (request: WebViewNavigation) => {
    if (isTrustedWebViewUrl(request.url)) return true;
    const externalUrl = getSafeExternalNavigationUrl(request.url);
    if (externalUrl) {
      Linking.openURL(externalUrl).catch(() => {
        Alert.alert('無法開啟瀏覽器', '請確認網路與系統瀏覽器狀態。');
      });
    }
    return false;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: Math.max(insets.top, SPACING.xs) }]}>
      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>時聊社區</Text>
          <Text style={[styles.headerUrl, { color: colors.textMuted }]}>chat.bdfz.net</Text>
        </View>
        <Pressable onPress={handleRefresh} style={styles.actionBtn}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Loading Progress Bar */}
      {isLoading && (
        <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(progress * 100, 5)}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      )}

      {/* WebView integration */}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://chat.bdfz.net/' }}
        originWhitelist={['https://*']}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={false}
        mixedContentMode="never"
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        geolocationEnabled={false}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={[styles.webview, { backgroundColor: colors.bgPrimary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerUrl: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionBtn: {
    padding: 4,
  },
  progressContainer: {
    height: 2,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  webview: {
    flex: 1,
  },
});
