import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { palette } from '../theme/colors';

interface Props {
  time: string;
  label: string;
  onGiveUp: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  showGiveUpButton?: boolean;
  showBackButton?: boolean;
}

const AlarmFireLayout: React.FC<Props> = ({
  time,
  label,
  onGiveUp,
  onBack,
  children,
  backgroundColor = palette.sunriseDark,
  showGiveUpButton = false,
  showBackButton = false
}) => {
  const statusBarPadding = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showBackButton && onBack && (
        <Button
          mode="contained-tonal"
          icon="arrow-left"
          compact
          style={[styles.backButton, { top: 16 + statusBarPadding }]}
          labelStyle={styles.backButtonLabel}
          onPress={onBack}
        >
          戻る
        </Button>
      )}

      <Text variant="labelLarge" style={styles.label}>
        アラーム
      </Text>
      <Text variant="displayLarge" style={styles.time}>
        {time}
      </Text>
      <Text variant="titleMedium" style={styles.subLabel}>
        {label}
      </Text>

      <Surface mode="flat" elevation={0} style={styles.panel}>
        {children}
      </Surface>

      {showGiveUpButton && (
        <Button mode="contained-tonal" style={styles.dismiss} labelStyle={styles.dismissText} onLongPress={onGiveUp}>
          長押しでギブアップ
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  label: {
    color: '#fff',
    fontWeight: '700'
  },
  time: {
    color: '#fff',
    fontWeight: '800',
    fontVariant: ['tabular-nums']
  },
  subLabel: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center'
  },
  panel: {
    width: '100%',
    marginTop: 28,
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.18)'
  },
  dismiss: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.22)'
  },
  dismissText: {
    color: '#fff',
    fontWeight: '700'
  },
  backButton: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  backButtonLabel: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default AlarmFireLayout;
