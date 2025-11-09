import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Alarm } from '../types';
import { AlarmCard } from '../components/AlarmCard';
import { palette, theme } from '../theme/colors';

interface Props {
  alarms: Alarm[];
  onCreate: () => void;
  onEdit: (alarm: Alarm) => void;
  onOpenSettings: () => void;
  onToggle: (alarmId: string, enabled: boolean) => void;
}

const HomeScreen: React.FC<Props> = ({ alarms, onCreate, onEdit, onOpenSettings, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>アラーム</Text>
        </View>
        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsButton}>
          <Text style={styles.settingsEmoji}>⚙️</Text>
          <Text style={styles.settingsText}>設定</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onPress={() => onEdit(item)}
            onToggle={(enabled) => onToggle(item.id, enabled)}
            mode={item.mode ?? 'fixed'}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.fab} onPress={onCreate} activeOpacity={0.9}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const statusBarPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 12 + statusBarPadding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '700'
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
