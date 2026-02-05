import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Switch } from 'react-native';
import { Alarm } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
  mode: 'fixed' | 'random';
}

export const AlarmCard: React.FC<Props> = ({ alarm, onPress, onToggle, mode }) => {
  return (
    <TouchableOpacity
      style={[styles.card, !alarm.active && styles.cardInactive]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.switchRow}>
        <Switch
          trackColor={{ false: palette.border, true: palette.sunrise }}
          thumbColor={theme.card}
          value={alarm.active}
          onValueChange={onToggle}
        />
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{alarm.time}</Text>
        <Text style={styles.subtitle}>{subtitleFor(alarm)}</Text>
        <Text style={styles.actionLabel}>
          {mode === 'fixed' ? labelForAction(alarm.action) : RANDOM_LABEL}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const subtitleFor = (alarm: Alarm) => {
  if (!alarm.repeatDays.length) {
    return alarm.title || 'アラーム';
  }
  return alarm.repeatDays.join(' / ');
};

const labelForAction = (action: Alarm['action']) => {
  switch (action) {
    case 'math':
      return '計算問題';
    case 'photo':
      return '証拠ショット';
    case 'shake':
      return 'シェイク解除';
    default:
      return 'アクション未設定';
  }
};

const RANDOM_LABEL = 'ランダム';

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: theme.card,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 24,
    marginBottom: 16,
    borderColor: palette.border,
    borderWidth: 1.2
  },
  cardInactive: {
    opacity: 0.6
  },
  switchRow: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1
  },
  timeBlock: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12
  },
  time: {
    color: theme.textPrimary,
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center'
  },
  subtitle: {
    color: theme.textSecondary,
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center'
  },
  actionLabel: {
    marginTop: 8,
    color: palette.sunriseDark,
    fontWeight: '600',
    textAlign: 'center'
  }
});
