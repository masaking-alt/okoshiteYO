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
          <Text style={styles.title}>おこしてYO!</Text>
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

      {/* アラームが0個の時だけ表示されるメッセージ */}
      {alarms.length === 0 && (
        <View style={styles.hintBubble}>
          <Text style={styles.hintText}>ここからアラームを追加してね！</Text>
          <View style={styles.hintArrow} /> {/* 下向きの矢印部分 */}
        </View>
      )}
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
  },
  hintBubble: {
    position: 'absolute',
    bottom: 105, // ＋ボタン（32+60=92）の少し上に配置
    right: 24,
    backgroundColor: palette.sunrise, // ボタンと同じ色にすると統一感が出ます
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    // 影をつけて浮かせる
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  hintText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  hintArrow: {
    position: 'absolute',
    bottom: -8, // 吹き出しのすぐ下に配置
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.sunrise, // 吹き出し本体と同じ色にする
  },
});

export default HomeScreen;
