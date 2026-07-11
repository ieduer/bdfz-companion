import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { getToken, saveToken } from '@/services/auth';

interface BdfzWebViewProps {
  sourceUrl: string;
  onNavigationStateChange?: (navState: WebViewNavigation) => void;
}

export default function BdfzWebView({ sourceUrl, onNavigationStateChange }: BdfzWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Load session token for cookie injection
  useEffect(() => {
    async function loadToken() {
      const token = await getToken();
      setSessionToken(token);
    }
    loadToken();
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Handled
      }
      return false; // Propagate
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setIsLoading(navState.loading);
    if (onNavigationStateChange) {
      onNavigationStateChange(navState);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'cookie' && data.token) {
        await saveToken(data.token);
        setSessionToken(data.token);
      }
    } catch (e) {
      // Ignore non-json messages
    }
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  // Inject session cookie before content loads
  const cookieScript = sessionToken
    ? `
      (function() {
        var token = "${sessionToken}";
        document.cookie = "bdfz_uc_session=" + token + "; domain=.bdfz.net; path=/; secure; SameSite=Lax";
        document.cookie = "bdfz_uc_session=" + token + "; domain=.rdfzer.com; path=/; secure; SameSite=Lax";
      })();
      true;
    `
    : '';

  // Intercept cookie after page loads (in case of fresh login)
  const afterLoadScript = `
    (function() {
      function checkCookie() {
        var match = document.cookie.match(new RegExp('(^| )bdfz_uc_session=([^;]+)'));
        if (match) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'cookie',
            token: match[2]
          }));
        }
      }
      checkCookie();
      // Periodically check in case of single-page transitions setting cookies
      setInterval(checkCookie, 2000);
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>網絡連接不可用</Text>
          <Text style={styles.errorSubtitle}>請檢查你的網絡設置，然後點擊重試</Text>
          <Pressable style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>重新整理</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: sourceUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          injectedJavaScriptBeforeContentLoaded={cookieScript}
          injectedJavaScript={afterLoadScript}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsBackForwardNavigationGestures={true}
          onError={() => setHasError(true)}
          onHttpError={() => setHasError(true)}
          style={styles.webView}
        />
      )}

      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.loadingText}>網頁載入中...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8fafc',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0284c7',
    borderRadius: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
