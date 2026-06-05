import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, Switch, Text } from 'react-native-paper';
import { Alarm } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
  mode: 'fixed' | 'random';
}

export const AlarmCard: React.FC<Props> = ({ alarm, onPress, onToggle, mode }) => {
  const actionLabel = mode === 'fixed' ? labelForAction(alarm.action) : RANDOM_LABEL;

  return (
    <Card
      mode={alarm.active ? 'elevated' : 'outlined'}
      style={[styles.card, !alarm.active && styles.cardInactive]}
      contentStyle={styles.cardContent}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.timeColumn}>
          <Text variant="displayMedium" style={styles.time}>
            {alarm.time}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle} numberOfLines={1}>
            {subtitleFor(alarm) || '繰り返しなし'}
          </Text>
        </View>
        <Switch value={alarm.active} onValueChange={onToggle} color={palette.sunriseDark} />
      </View>

      <View style={styles.metaRow}>
        <Chip compact mode="flat" icon={mode === 'random' ? 'shuffle-variant' : iconForAction(alarm.action)}>
          {actionLabel}
        </Chip>
        <Chip compact mode="outlined" icon={alarm.active ? 'bell-ring-outline' : 'bell-off-outline'}>
          {alarm.active ? '有効' : '停止中'}
        </Chip>
      </View>
    </Card>
  );
};

const subtitleFor = (alarm: Alarm) => {
  if (!alarm.repeatDays.length) {
    return alarm.title;
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

const iconForAction = (action: Alarm['action']) => {
  switch (action) {
    case 'math':
      return 'calculator-variant-outline';
    case 'photo':
      return 'camera-outline';
    case 'shake':
      return 'gesture-tap-button';
    default:
      return 'alarm';
  }
};

const RANDOM_LABEL = 'ランダム';

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    backgroundColor: theme.card
  },
  cardInactive: {
    opacity: 0.64
  },
  cardContent: {
    paddingVertical: 18
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  timeColumn: {
    flex: 1
  },
  time: {
    color: theme.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  subtitle: {
    color: theme.textSecondary,
    marginTop: 4
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  }
});
