import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import Animated, {
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  deleteToken,
  exchangeNativeSessionHandoff,
  getToken,
  isValidSessionToken,
  saveToken,
} from '@/services/auth';
import {
  getNativeSessionBootstrapUrl,
  getSafeExternalNavigationUrl,
  getTrustedWebViewUrl,
  isExternalOnlyUrl,
  isTrustedSessionBridgeUrl,
  isTrustedWebViewUrl,
} from '@/services/urlPolicy';
import { RADIUS, SPACING, useTheme } from '@/constants/theme';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function WebViewScreen() {
  const params = useLocalSearchParams<{ url?: string | string[]; title?: string | string[] }>();
  const requestedUrl = firstParam(params.url);
  const title = firstParam(params.title) || 'BDFZ';
  const initialUrl = useMemo(() => getTrustedWebViewUrl(requestedUrl), [requestedUrl]);
  const externalOnly = useMemo(() => isExternalOnlyUrl(requestedUrl), [requestedUrl]);
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const handoffInFlightRef = useRef(false);

  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialUrl || '');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(initialUrl));

  const progress = useSharedValue(0);
  const progressVisible = useSharedValue(Boolean(initialUrl));

  useEffect(() => {
    let active = true;
    async function loadToken() {
      const token = await getToken();
      if (!active) return;
      if (isValidSessionToken(token)) {
        setSessionToken(token);
      } else if (token) {
        await deleteToken();
      }
      setTokenReady(true);
    }
    loadToken();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  const openExternal = useCallback(async (value: string) => {
    const safeUrl = getSafeExternalNavigationUrl(value);
    if (!safeUrl) return;
    try {
      await Linking.openURL(safeUrl);
    } catch {
      Alert.alert('無法開啟瀏覽器', '請確認網路與系統瀏覽器狀態。');
    }
  }, []);

  const handleShouldStartLoad = useCallback((request: WebViewNavigation) => {
    if (isTrustedWebViewUrl(request.url)) return true;
    const safeExternal = getSafeExternalNavigationUrl(request.url);
    if (safeExternal) void openExternal(safeExternal);
    return false;
  }, [openExternal]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    if (!isTrustedWebViewUrl(navState.url)) return;
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
  }, []);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    if (!isTrustedSessionBridgeUrl(event.nativeEvent.url)) return;
    const raw = event.nativeEvent.data;
    if (typeof raw !== 'string' || raw.length > 5000) return;
    try {
      const data = JSON.parse(raw);
      if (data?.type !== 'native-handoff' || !/^[a-f0-9]{64}$/.test(String(data.code || ''))) return;
      if (handoffInFlightRef.current) return;
      handoffInFlightRef.current = true;
      const exchanged = await exchangeNativeSessionHandoff(data.code);
      await saveToken(exchanged.token);
      setSessionToken(exchanged.token);
      Alert.alert('連接成功', '已成功與 BDFZ 用戶中心同步！', [
        { text: '確定', onPress: () => router.back() },
      ]);
    } catch {
      // The page retries with a new short-lived handoff while it remains open.
    } finally {
      handoffInFlightRef.current = false;
    }
  }, [router]);

  const handleLoadProgress = useCallback(({ nativeEvent }: { nativeEvent: { progress: number } }) => {
    progress.value = withTiming(nativeEvent.progress, { duration: 200 });
    progressVisible.value = nativeEvent.progress < 1;
    if (nativeEvent.progress >= 1) setIsLoading(false);
  }, [progress, progressVisible]);

  const handleLoadStart = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    progress.value = 0.05;
    progressVisible.value = true;
  }, [progress, progressVisible]);

  const handleShare = useCallback(async () => {
    if (!isTrustedWebViewUrl(currentUrl)) return;
    await Share.share({ message: `${title}: ${currentUrl}` }).catch(() => {});
  }, [currentUrl, title]);

  const nativeBootstrapUrl = useMemo(
    () => (sessionToken && initialUrl ? getNativeSessionBootstrapUrl(initialUrl) : null),
    [initialUrl, sessionToken],
  );
  const webViewSource = useMemo(() => {
    if (!initialUrl) return null;
    if (nativeBootstrapUrl && sessionToken) {
      return {
        uri: nativeBootstrapUrl,
        headers: { Cookie: `bdfz_uc_session=${sessionToken}` },
      };
    }
    return { uri: initialUrl };
  }, [initialUrl, nativeBootstrapUrl, sessionToken]);

  const afterLoadScript = useMemo(() => {
    if (sessionToken || !initialUrl || !isTrustedSessionBridgeUrl(initialUrl)) return 'true;';
    return `(function(){
    var host=location.hostname.toLowerCase();
    if(host!=='my.bdfz.net'&&host!=='uc.bdfz.net') return true;
    var handoffBusy=false;
    async function sendSessionHandoff(){
      if(handoffBusy) return;
      handoffBusy=true;
      try {
        var response=await fetch('/api/session/native-handoff',{
          method:'POST',
          credentials:'same-origin',
          headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify({client:'bdfz-companion'})
        });
        if(!response.ok) return;
        var data=await response.json();
        if(data&&data.ok&&/^[a-f0-9]{64}$/.test(String(data.code||''))){
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'native-handoff',code:data.code}));
        }
      } catch (_) {
        // Login may still be in progress; the interval retries.
      } finally {
        handoffBusy=false;
      }
    }
    sendSessionHandoff();
    window.setInterval(sendSessionHandoff,3000);
  })(); true;`;
  }, [initialUrl, sessionToken]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%` as `${number}%`,
    opacity: progressVisible.value ? 1 : 0,
  }));

  const showBlocked = !initialUrl;

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      style={[styles.root, { backgroundColor: colors.bgPrimary, paddingTop: insets.top }]}
    >
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { backgroundColor: colors.accent }, progressBarStyle]} />
      </View>

      <Animated.View
        entering={FadeIn.delay(150).duration(250)}
        style={[styles.appBar, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }]}
      >
        <Pressable onPress={() => router.back()} style={styles.actionButton} accessibilityLabel="關閉並返回">
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>

        {canGoBack && !showBlocked && (
          <Pressable onPress={() => webViewRef.current?.goBack()} style={styles.actionButton} accessibilityLabel="回到上一頁">
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {showBlocked ? '外部連結' : currentUrl}
          </Text>
        </View>

        {!showBlocked && (
          <>
            <Pressable onPress={() => webViewRef.current?.reload()} style={styles.actionButton} accessibilityLabel="重新整理">
              <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.actionButton} accessibilityLabel="分享頁面">
              <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => openExternal(currentUrl)} style={styles.actionButton} accessibilityLabel="以系統瀏覽器打開">
              <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </>
        )}
      </Animated.View>

      <View style={styles.webViewWrapper}>
        {initialUrl && tokenReady && webViewSource ? (
          <WebView
            ref={webViewRef}
            source={webViewSource}
            originWhitelist={['https://*']}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onLoadProgress={handleLoadProgress}
            onLoadStart={handleLoadStart}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
            onHttpError={() => { setHasError(true); setIsLoading(false); }}
            injectedJavaScript={afterLoadScript}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled={false}
            domStorageEnabled
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically={false}
            setSupportMultipleWindows={false}
            mixedContentMode="never"
            allowFileAccess={false}
            allowFileAccessFromFileURLs={false}
            allowUniversalAccessFromFileURLs={false}
            geolocationEnabled={false}
            allowsBackForwardNavigationGestures
            style={styles.webView}
          />
        ) : !initialUrl ? (
          <View style={[styles.errorOverlay, { backgroundColor: colors.bgPrimary }]}>
            <Ionicons name={externalOnly ? 'open-outline' : 'shield-checkmark-outline'} size={48} color={colors.accent} />
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
              {externalOnly ? '以系統瀏覽器開啟' : '已阻擋不安全連結'}
            </Text>
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              {externalOnly
                ? '此服務尚未提供 HTTPS，App 不會在內嵌頁面傳遞帳戶狀態。'
                : '為保護帳戶與裝置資料，App 只會在內嵌頁面開啟受信任的 BDFZ/RDFZ HTTPS 網址。'}
            </Text>
            {externalOnly && (
              <Pressable
                onPress={() => openExternal(requestedUrl)}
                style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.retryText}>繼續開啟</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {isLoading && !hasError && initialUrl && (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}

        {hasError && (
          <View style={[styles.errorOverlay, { backgroundColor: colors.bgPrimary }]}>
            <Ionicons name="wifi-outline" size={48} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>連線失敗</Text>
            <Text style={[styles.errorText, { color: colors.textMuted }]}>請檢查網路連線，或稍後再試。</Text>
            <Pressable
              onPress={() => { setHasError(false); webViewRef.current?.reload(); }}
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.retryText}>重新嘗試</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progressTrack: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'transparent', zIndex: 200,
  },
  progressBar: { height: '100%' },
  appBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, height: 56,
  },
  actionButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1, marginHorizontal: 8, justifyContent: 'center' },
  pageTitle: { fontSize: 14, fontWeight: '700' },
  pageSubtitle: { fontSize: 10, marginTop: 2 },
  webViewWrapper: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', right: 18, bottom: 18, width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.86)',
  },
  errorOverlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, gap: SPACING.md,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  errorText: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: SPACING.md },
  retryBtn: { paddingVertical: 11, paddingHorizontal: 24, borderRadius: RADIUS.md, marginTop: 8 },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
