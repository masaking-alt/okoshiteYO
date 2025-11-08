import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Alarm } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  alarm: Alarm;
  onPress: () => void;
}

export const AlarmCard: React.FC<Props> = ({ alarm, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, !alarm.active && styles.cardInactive]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.time}>{alarm.time}</Text>
          <Text style={styles.title}>{alarm.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor(alarm.action) }]}>
          <Text style={styles.badgeText}>{labelForAction(alarm.action)}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{alarm.nextTriggerLabel}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{alarm.actionDetail}</Text>
        <View style={styles.dot} />
        <Text style={styles.meta}>{alarm.toneLabel}</Text>
      </View>
      <View style={styles.dayRow}>
        {alarm.repeatDays.map((day) => (
          <View key={day} style={styles.dayChip}>
            <Text style={styles.dayChipText}>{day}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const badgeColor = (action: Alarm['action']) => {
  switch (action) {
    case 'math':
      return palette.sunrise;
    case 'photo':
      return palette.lavender;
    case 'shake':
    default:
      return palette.mint;
  }
};

const labelForAction = (action: Alarm['action']) => {
  switch (action) {
    case 'math':
      return 'CALC';
    case 'photo':
      return 'PROOF';
    case 'shake':
      return 'MOVE';
    default:
      return 'ACTION';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    borderColor: palette.border,
    borderWidth: 1
  },
  cardInactive: {
    opacity: 0.5
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  time: {
    color: theme.textPrimary,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1
  },
  title: {
    color: theme.textSecondary,
    fontSize: 16,
    marginTop: 4
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  badgeText: {
    color: palette.ink,
    fontWeight: '700',
    fontSize: 12
  },
  meta: {
    color: theme.textSecondary,
    marginTop: 12,
    fontSize: 14
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.textSecondary,
    marginHorizontal: 8
  },
  dayRow: {
    flexDirection: 'row',
    marginTop: 14,
    flexWrap: 'wrap'
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.cardMuted,
    marginRight: 8,
    marginBottom: 6
  },
  dayChipText: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  }
});
