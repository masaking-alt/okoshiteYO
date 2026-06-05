import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Appbar, Button, Card, Chip, RadioButton, SegmentedButtons, Surface, Text, TextInput as PaperTextInput } from 'react-native-paper';
import { AlarmAction, Alarm } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  alarm?: Alarm;
  onBack: () => void;
  onPreviewAction: (action: AlarmAction) => void;
  onSave: (alarm: Alarm) => void;
  onDelete?: (alarmId: string) => void;
  defaultAction: AlarmAction;
  defaultMode: 'fixed' | 'random';
}

const days = ['月', '火', '水', '木', '金', '土', '日'];

const actionOptions: { key: AlarmAction; title: string; hint: string; icon: string }[] = [
  { key: 'math', title: '計算チャレンジ', hint: '計算を3問解いて解除', icon: 'calculator-variant-outline' },
  { key: 'shake', title: 'シェイク解除', hint: 'スマホを50回振って解除', icon: 'gesture-tap-button' },
  { key: 'photo', title: '証拠ショット', hint: '指定された物を撮影して解除', icon: 'camera-outline' }
];

interface TimePickerProps {
  value: string;
  onValueChange: (newValue: string) => void;
  type: 'hour' | 'minute';
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onValueChange, type }) => {
  const maxValue = type === 'hour' ? 23 : 59;

  const handleInputChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    if (numericOnly === '') {
      onValueChange('');
      return;
    }
    if (numericOnly.length > 2) {
      return;
    }

    const numVal = Number.parseInt(numericOnly, 10);
    if (numericOnly.length === 1) {
      onValueChange(numericOnly);
      return;
    }
    onValueChange(twoDigit(Math.min(numVal, maxValue)));
  };

  return (
    <PaperTextInput
      mode="outlined"
      label={type === 'hour' ? '時' : '分'}
      value={value}
      onChangeText={handleInputChange}
      keyboardType="number-pad"
      maxLength={2}
      selectTextOnFocus
      multiline={false}
      style={styles.timeInput}
      contentStyle={styles.timeInputContent}
      outlineStyle={styles.timeInputOutline}
      activeOutlineColor={palette.sunriseDark}
    />
  );
};

const EditorScreen: React.FC<Props> = ({ alarm, onBack, onPreviewAction, onSave, onDelete, defaultAction, defaultMode }) => {
  const [hour, setHour] = useState<string>((alarm?.time ?? '07:30').split(':')[0]);
  const [minutes, setMinutes] = useState<string>((alarm?.time ?? '07:30').split(':')[1]);
  const [mode, setMode] = useState<'fixed' | 'random'>(alarm?.mode ?? defaultMode);
  const [selectedAction, setSelectedAction] = useState<AlarmAction>(alarm?.action ?? defaultAction);
  const [repeatDays, setRepeatDays] = useState<string[]>(alarm?.repeatDays ?? ['月', '火', '水', '木', '金', '土', '日']);
  const [memo, setMemo] = useState<string>(alarm?.title ?? '');

  const toggleDay = (day: string) => {
    setRepeatDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => days.indexOf(a) - days.indexOf(b));
    });
  };

  const handleSave = () => {
    const finalHour = normalizeTimePart(hour, 23);
    const finalMinutes = normalizeTimePart(minutes, 59);
    const title = memo.trim();

    const payload: Alarm = {
      id: alarm?.id ?? Date.now().toString(),
      title,
      time: `${finalHour}:${finalMinutes}`,
      repeatDays,
      action: selectedAction,
      mode,
      active: alarm?.active ?? true
    };
    onSave(payload);
  };

  const handleDelete = () => {
    if (!alarm?.id || !onDelete) {
      return;
    }
    onDelete(alarm.id);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" statusBarHeight={appbarStatusBarHeight} style={styles.appbar}>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title={alarm ? 'アラーム編集' : 'アラーム追加'} titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="check" onPress={handleSave} />
      </Appbar.Header>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
      >
        <Surface mode="flat" style={styles.timeSurface}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            時刻
          </Text>
          <View style={styles.timeInputRow}>
            <TimePicker value={hour} onValueChange={setHour} type="hour" />
            <Text variant="displaySmall" style={styles.timeColon}>
              :
            </Text>
            <TimePicker value={minutes} onValueChange={setMinutes} type="minute" />
          </View>
        </Surface>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          繰り返し
        </Text>
        <View style={styles.dayRow}>
          {days.map((day) => {
            const active = repeatDays.includes(day);
            return (
              <Chip
                key={day}
                selected={active}
                showSelectedCheck={false}
                mode={active ? 'flat' : 'outlined'}
                onPress={() => toggleDay(day)}
                style={[styles.dayChip, active && styles.dayChipActive]}
                textStyle={[styles.dayChipText, active && styles.dayChipTextActive]}
              >
                {day}
              </Chip>
            );
          })}
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          解除モード
        </Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value: string) => setMode(value as 'fixed' | 'random')}
          buttons={[
            { value: 'fixed', label: '選択制', icon: 'target' },
            { value: 'random', label: 'ランダム', icon: 'shuffle-variant' }
          ]}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          解除アクション
        </Text>
        {mode === 'fixed' &&
          actionOptions.map((action) => {
            const active = action.key === selectedAction;
            return (
              <Card
                key={action.key}
                mode={active ? 'elevated' : 'outlined'}
                style={[styles.actionCard, active && styles.actionCardActive]}
                onPress={() => setSelectedAction(action.key)}
                onLongPress={() => onPreviewAction(action.key)}
              >
                <Card.Content style={styles.actionContent}>
                  <View style={styles.actionTextColumn}>
                    <Text variant="titleSmall" style={styles.actionTitle}>
                      {action.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.actionHint}>
                      {action.hint}
                    </Text>
                    <Text variant="labelSmall" style={styles.previewHint}>
                      長押しでプレビュー
                    </Text>
                  </View>
                  <RadioButton.Android
                    value={action.key}
                    status={active ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedAction(action.key)}
                    color={palette.sunriseDark}
                  />
                </Card.Content>
              </Card>
            );
          })}

        {mode === 'random' && (
          <Surface mode="flat" style={styles.randomNotice}>
            <Text variant="titleSmall" style={styles.actionTitle}>
              ランダムアクション
            </Text>
            <Text variant="bodyMedium" style={styles.randomHelper}>
              計算 / シェイク / 証拠ショットの3種類からランダムに出題されます。
            </Text>
          </Surface>
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          メモ
        </Text>
        <PaperTextInput
          mode="outlined"
          placeholder="例: 英語プレゼン用アラーム"
          value={memo}
          onChangeText={setMemo}
          multiline
          style={styles.memoInput}
          activeOutlineColor={palette.sunriseDark}
        />

        <Button mode="contained" icon="content-save-outline" style={styles.primaryButton} onPress={handleSave}>
          保存
        </Button>
        {alarm?.id && onDelete && (
          <Button mode="outlined" icon="delete-outline" textColor="#BA1A1A" style={styles.deleteButton} onPress={handleDelete}>
            削除
          </Button>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

const appbarStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

const normalizeTimePart = (value: string, max: number) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return '00';
  }
  return twoDigit(Math.max(0, Math.min(parsed, max)));
};

const twoDigit = (value: number) => value.toString().padStart(2, '0');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  appbar: {
    backgroundColor: theme.background
  },
  appbarTitle: {
    fontWeight: '700'
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 112
  },
  timeSurface: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: theme.cardMuted
  },
  sectionLabel: {
    color: theme.textSecondary,
    marginBottom: 12
  },
  sectionTitle: {
    color: theme.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 24
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  timeInput: {
    width: 132,
    backgroundColor: theme.card
  },
  timeInputContent: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  timeInputOutline: {
    borderRadius: 18
  },
  timeColon: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  dayChip: {
    minWidth: 44
  },
  dayChipActive: {
    backgroundColor: theme.accentSoft
  },
  dayChipText: {
    color: theme.textSecondary,
    fontWeight: '700'
  },
  dayChipTextActive: {
    color: palette.sunriseDark
  },
  actionCard: {
    marginBottom: 12,
    backgroundColor: theme.card
  },
  actionCardActive: {
    backgroundColor: theme.accentSoft
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionTextColumn: {
    flex: 1
  },
  actionTitle: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  actionHint: {
    color: theme.textSecondary,
    marginTop: 4
  },
  previewHint: {
    color: palette.sunriseDark,
    marginTop: 6
  },
  randomNotice: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.cardMuted
  },
  randomHelper: {
    color: theme.textSecondary,
    marginTop: 8,
    lineHeight: 20
  },
  memoInput: {
    minHeight: 104,
    backgroundColor: theme.card
  },
  primaryButton: {
    marginTop: 24
  },
  deleteButton: {
    marginTop: 12,
    borderColor: '#BA1A1A'
  }
});

export default EditorScreen;
