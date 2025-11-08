import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Alarm } from '../types';
import { AlarmCard } from '../components/AlarmCard';
import { palette, theme } from '../theme/colors';

interface Props {
  alarms: Alarm[];
  upcomingAlarm: Alarm;
  onCreate: () => void;
  onEdit: (alarm: Alarm) => void;
  onOpenSettings: () => void;
}

const HomeScreen: React.FC<Props> = ({ alarms, upcomingAlarm, onCreate, onEdit, onOpenSettings }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingLabel}>おこしてYO！</Text>
          <Text style={styles.nextLabel}>次のアラーム</Text>
          <Text style={styles.nextTime}>{upcomingAlarm.time}</Text>
        </View>
        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsButton}>
          <Text style={styles.settingsEmoji}>⚙️</Text>
          <Text style={styles.settingsText}>設定</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>{upcomingAlarm.title}</Text>
        <Text style={styles.heroSubtitle}>{upcomingAlarm.nextTriggerLabel}</Text>
        <View style={styles.heroActionRow}>
          <Text style={styles.heroAction}>{upcomingAlarm.actionDetail}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>絶対起こすマン</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>アラーム一覧</Text>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlarmCard alarm={item} onPress={() => onEdit(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.fab} onPress={onCreate} activeOpacity={0.9}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetingLabel: {
    color: theme.textSecondary,
    fontSize: 16,
    marginBottom: 4
  },
  nextLabel: {
    color: theme.textSecondary,
    fontSize: 14
  },
  nextTime: {
    color: theme.textPrimary,
    fontSize: 48,
    fontWeight: '700',
    marginTop: 4
  },
  settingsButton: {
    alignItems: 'center'
  },
  settingsEmoji: {
    fontSize: 28
  },
  settingsText: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  heroCard: {
    backgroundColor: theme.card,
    borderRadius: 22,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.divider
  },
  heroTitle: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: '600'
  },
  heroSubtitle: {
    color: theme.textSecondary,
    marginTop: 4
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16
  },
  heroAction: {
    color: palette.sunrise,
    fontWeight: '600'
  },
  heroBadge: {
    backgroundColor: theme.cardMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  heroBadgeText: {
    color: theme.textSecondary,
    fontSize: 12
  },
  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.sunrise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  fabText: {
    color: palette.white,
    fontSize: 30,
    lineHeight: 32
  }
});

export default HomeScreen;
