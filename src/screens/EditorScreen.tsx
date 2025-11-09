import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { AlarmAction, Alarm } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  alarm?: Alarm;
  onBack: () => void;
  onPreviewAction: (action: AlarmAction) => void;
  onSave: (alarm: Alarm) => void;
  defaultAction: AlarmAction;
  defaultMode: 'fixed' | 'random';
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const actionOptions: { key: AlarmAction; title: string; hint: string; accent: string }[] = [
  { key: 'math', title: '計算チャレンジ', hint: '3問解かないと止まらない', accent: palette.sunrise },
  { key: 'shake', title: 'シェイク解除', hint: '50回振ると解除', accent: palette.mint },
  { key: 'photo', title: '証拠ショット', hint: '登録した場所を撮影', accent: palette.lavender }
];

const EditorScreen: React.FC<Props> = ({ alarm, onBack, onPreviewAction, onSave, defaultAction, defaultMode }) => {
  const [hour, minutes] = (alarm?.time ?? '07:30').split(':');
  const [mode, setMode] = useState<'fixed' | 'random'>(alarm?.mode ?? defaultMode);
  const [selectedAction, setSelectedAction] = useState<AlarmAction>(alarm?.action ?? defaultAction);
  const effectiveMode = mode;

  const handleSave = () => {
    const payload: Alarm = {
      id: alarm?.id ?? Date.now().toString(),
      title: alarm?.title ?? '新しいアラーム',
      time: `${hour}:${minutes}`,
      repeatDays: alarm?.repeatDays ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      action: selectedAction,
      mode,
      active: alarm?.active ?? true
    };
    onSave(payload);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>{alarm ? 'アラーム編集' : 'アラーム追加'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.label}>時刻</Text>
        <View style={styles.timeRow}>
          <TouchableOpacity style={styles.timeBox}>
            <Text style={styles.timeBoxText}>{hour}</Text>
            <Text style={styles.timeCaption}>o'clock</Text>
          </TouchableOpacity>
          <Text style={styles.timeColon}>:</Text>
          <TouchableOpacity style={styles.timeBox}>
            <Text style={styles.timeBoxText}>{minutes}</Text>
            <Text style={styles.timeCaption}>min</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>繰り返し</Text>
        <View style={styles.dayRow}>
          {days.map((day) => {
            const active = alarm?.repeatDays?.includes(day) ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day);
            return (
              <View key={day} style={[styles.dayChip, active && styles.dayChipActive]}>
                <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{day}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.label}>解除モード</Text>
        <View style={styles.modeRow}>
          {(['fixed', 'random'] as const).map((value) => {
            const active = mode === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.modeChip, active && styles.modeChipActive]}
                onPress={() => setMode(value)}
              >
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                  {value === 'fixed' ? '選択制' : 'ランダム'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>解除アクション</Text>
        {effectiveMode === 'fixed' &&
          actionOptions.map((action) => {
            const active = action.key === selectedAction;
            return (
              <TouchableOpacity
                key={action.key}
                style={[styles.actionCard, active && { borderColor: action.accent }]}
                onPress={() => setSelectedAction(action.key)}
                onLongPress={() => onPreviewAction(action.key)}
              >
                <View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionHint}>{action.hint}</Text>
                </View>
                <View style={[styles.actionBadge, { backgroundColor: action.accent }]}>
                  <Text style={styles.actionBadgeText}>{active ? '選択中' : '長押しでプレビュー'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {effectiveMode === 'random' && (
          <View style={styles.randomNotice}>
            <Text style={styles.actionTitle}>ランダムアクション</Text>
            <Text style={styles.randomHelper}>計算 / シェイク / 証拠ショットの3種類から毎回ランダムに出題されます。</Text>
          </View>
        )}

        <Text style={styles.label}>メモ</Text>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{alarm?.title ?? '例: 英語プレゼン用アラーム'}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>保存</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const statusBarPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 16 + statusBarPadding
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  backText: {
    color: theme.textPrimary,
    fontSize: 22
  },
  toolbarTitle: {
    color: theme.textPrimary,
    fontWeight: '600',
    fontSize: 18
  },
  label: {
    color: theme.textSecondary,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 12
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeBox: {
    flex: 1,
    backgroundColor: theme.card,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.divider
  },
  timeBoxText: {
    color: theme.textPrimary,
    fontSize: 36,
    fontWeight: '700'
  },
  timeCaption: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  timeColon: {
    color: theme.textPrimary,
    fontSize: 40,
    paddingHorizontal: 12
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.divider,
    marginRight: 8,
    marginBottom: 8
  },
  dayChipActive: {
    backgroundColor: theme.card,
    borderColor: palette.sunrise
  },
  dayChipText: {
    color: theme.textSecondary,
    fontWeight: '600'
  },
  dayChipTextActive: {
    color: theme.textPrimary
  },
  actionCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.divider,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '600'
  },
  actionHint: {
    color: theme.textSecondary,
    marginTop: 6
  },
  actionBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  actionBadgeText: {
    color: palette.ink,
    fontWeight: '700'
  },
  noteBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    backgroundColor: theme.card,
    padding: 16,
    minHeight: 100,
    marginBottom: 16
  },
  noteText: {
    color: theme.textSecondary,
    lineHeight: 20
  },
  primaryButton: {
    backgroundColor: palette.sunrise,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  },
  randomHelper: {
    color: theme.textSecondary,
    marginTop: 8,
    lineHeight: 20
  },
  randomNotice: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    padding: 20,
    marginBottom: 12
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  modeChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.divider,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modeChipActive: {
    borderColor: palette.sunrise,
    backgroundColor: theme.card
  },
  modeChipText: {
    color: theme.textSecondary,
    fontWeight: '600'
  },
  modeChipTextActive: {
    color: palette.sunriseDark
  },
  helperText: {
    color: theme.textSecondary,
    fontSize: 12
  }
});

export default EditorScreen;
