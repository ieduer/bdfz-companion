import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { CATEGORIES, SiteLink } from '@/constants/sites';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

interface ConsoleSearchProps {
  visible: boolean;
  onClose: () => void;
  onLinkSelect: (link: SiteLink) => void;
}

interface FlattenedLink extends SiteLink {
  categoryLabel: string;
  categoryColor: string;
}

// Blinking caret terminal effect
function BlinkingCaret() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);
  return <Text style={{ color: COLORS.cyberCyan, opacity: visible ? 1 : 0 }}>_</Text>;
}

export default function ConsoleSearch({ visible, onClose, onLinkSelect }: ConsoleSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Flatten all site links with category metadata for quick indexing
  const allLinks = React.useMemo(() => {
    const list: FlattenedLink[] = [];
    CATEGORIES.forEach(cat => {
      cat.links.forEach(link => {
        list.push({
          ...link,
          categoryLabel: cat.label,
          categoryColor: cat.accentColor,
        });
      });
    });
    return list;
  }, []);

  // Filter links based on label or URL query
  const filteredLinks = React.useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase();
    return allLinks.filter(
      link =>
        link.label.toLowerCase().includes(normalized) ||
        (link.aria && link.aria.toLowerCase().includes(normalized)) ||
        link.href.toLowerCase().includes(normalized)
    );
  }, [query, allLinks]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    } else {
      setQuery('');
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.duration(300).springify().damping(22)}
          exiting={SlideOutDown.duration(200)}
          style={styles.terminalContainer}
        >
          {/* Terminal Header */}
          <View style={styles.terminalHeader}>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
              <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
              <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
            </View>
            <Text style={styles.terminalTitle}>console_launcher_sh</Text>
            <Pressable onPress={onClose} hitSlop={15}>
              <Text style={styles.closeBtn}>ESC</Text>
            </Pressable>
          </View>

          {/* Terminal Command Line Input */}
          <View style={styles.cmdRow}>
            <Text style={styles.prompt}>guest@bdfz_core:~$</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="輸入站點拼音、英文或關鍵字搜尋..."
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length === 0 && <BlinkingCaret />}
          </View>

          {/* Query Results */}
          <ScrollView
            style={styles.resultsScroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {query.length > 0 && filteredLinks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.terminalLog}>&gt; ERR: No site matching "{query}" found in records.</Text>
                <Text style={styles.terminalLog}>&gt; Try checking spelling or use categories on explore panel.</Text>
              </View>
            ) : query.length === 0 ? (
              <View style={styles.hintContainer}>
                <Text style={styles.terminalLog}>&gt; System initialized. Ready for telemetry filters.</Text>
                <Text style={styles.terminalLog}>&gt; Type site names to bypass navigation folders.</Text>
                <View style={styles.shortcutRow}>
                  <Text style={styles.shortcutLabel}>熱門快捷:</Text>
                  {allLinks.slice(0, 4).map((link, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => onLinkSelect(link)}
                      style={styles.shortcutTag}
                    >
                      <Text style={styles.shortcutText}>{link.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              filteredLinks.map((link, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => onLinkSelect(link)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    pressed && styles.resultRowPressed
                  ]}
                >
                  <View style={styles.resultMain}>
                    <Text style={styles.resultLabel}>{link.label}</Text>
                    <Text style={styles.resultUrl} numberOfLines={1}>{link.href}</Text>
                  </View>
                  <View style={[styles.badge, { borderColor: `${link.categoryColor}40`, backgroundColor: `${link.categoryColor}10` }]}>
                    <Text style={[styles.badgeText, { color: link.categoryColor }]}>
                      {link.categoryLabel}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.bgOverlay,
    justifyContent: 'flex-end',
  },
  terminalContainer: {
    height: '60%',
    backgroundColor: '#030509',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#080C14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  dotsRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  terminalTitle: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  closeBtn: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.cyberPink,
    fontWeight: 'bold',
  },
  cmdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.08)',
    backgroundColor: '#05080F',
  },
  prompt: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.cyberGreen,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
  },
  resultsScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
  },
  hintContainer: {
    paddingVertical: SPACING.md,
  },
  terminalLog: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  shortcutLabel: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  shortcutTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  shortcutText: {
    fontSize: 11,
    color: COLORS.cyberCyan,
    fontFamily: FONTS.mono,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  resultRowPressed: {
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
  },
  resultMain: {
    flex: 1,
    marginRight: SPACING.md,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  resultUrl: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
