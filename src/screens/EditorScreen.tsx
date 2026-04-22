import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, NativeScrollEvent, NativeSyntheticEvent, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AlarmAction, Alarm } from '../types';
import { ALARM_VOLUME_STEP, formatAlarmVolume, normalizeAlarmVolume } from '../services/alarmVolume';
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

const actionOptions: { key: AlarmAction; title: string; hint: string; accent: string }[] = [
  { key: 'math', title: '計算チャレンジ', hint: '計算を3問解いて解除', accent: palette.sunrise },
  { key: 'shake', title: 'シェイク解除', hint: 'スマホを50回振って解除', accent: palette.sunrise },
  { key: 'photo', title: '証拠ショット', hint: '指定された物を撮影して解除', accent: palette.sunrise }
];

interface TimePickerProps {
  value: string;
  onValueChange: (newValue: string) => void;
  type: 'hour' | 'minute';
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onValueChange, type }) => {
  const maxValue = type === 'hour' ? 23 : 59;
  
  const handleInputChange = (text: string) => {
    // 数字のみを許可
    const numericOnly = text.replace(/[^0-9]/g, '');
    
    // 空文字列は許可（削除の場合）
    if (numericOnly === '') {
      onValueChange('');
      return;
    }
    
    // 最大2文字まで
    if (numericOnly.length <= 2) {
      const numVal = parseInt(numericOnly, 10);
      
      // 1文字の場合はそのまま渡す、2文字の場合は範囲チェック
      if (numericOnly.length === 1) {
        onValueChange(numericOnly);
      } else if (numVal <= maxValue) {
        onValueChange(twoDigit(numVal));
      } else if (numericOnly.length === 2) {
        // 範囲外の場合、最大値で止める
        onValueChange(twoDigit(maxValue));
      }
    }
  };

  return (
    <View style={styles.timeInputWrapper}>
      <TextInput
        style={styles.timeInput}
        value={value}
        onChangeText={handleInputChange}
        keyboardType="numeric"
        maxLength={2}
        editable={true}
        selectTextOnFocus={true}
        multiline={false}
        scrollEnabled={false}
        allowFontScaling={false}
      />
    </View>
  );
};

const EditorScreen: React.FC<Props> = ({
  alarm,
  onBack,
  onPreviewAction,
  onSave,
  onDelete,
  defaultAction,
  defaultMode
}) => {
  const [hour, setHour] = useState<string>((alarm?.time ?? '07:30').split(':')[0]);
  const [minutes, setMinutes] = useState<string>((alarm?.time ?? '07:30').split(':')[1]);
  const [mode, setMode] = useState<'fixed' | 'random'>(alarm?.mode ?? defaultMode);
  const [selectedAction, setSelectedAction] = useState<AlarmAction>(alarm?.action ?? defaultAction);
  const [repeatDays, setRepeatDays] = useState<string[]>(alarm?.repeatDays ?? ['月', '火', '水', '木', '金','土','日']);
  const [memo, setMemo] = useState<string>(alarm?.title ?? '');
  const [volume, setVolume] = useState<number>(normalizeAlarmVolume(alarm?.volume));

  const toggleDay = (day: string) => {
    setRepeatDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => days.indexOf(a) - days.indexOf(b));
    });
  };


  const handleSave = () => {
    // 空白または未入力の場合は「00」にする
    const finalHour = hour && hour !== '' ? twoDigit(parseInt(hour, 10)) : '00';
    const finalMinutes = minutes && minutes !== '' ? twoDigit(parseInt(minutes, 10)) : '00';
    const title = memo.trim();

    const payload: Alarm = {
      id: alarm?.id ?? Date.now().toString(),
      title,
      time: `${finalHour}:${finalMinutes}`,
      repeatDays,
      action: selectedAction,
      mode,
      volume: normalizeAlarmVolume(volume),
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
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>{alarm ? 'アラーム編集' : 'アラーム追加'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
      >
        <Text style={styles.label}>時刻</Text>
          <View style={styles.timeInputRow}>
            <TimePicker value={hour} onValueChange={setHour} type="hour" />
            <Text style={styles.timeColon}>:</Text>
            <TimePicker value={minutes} onValueChange={setMinutes} type="minute" />
          </View>
        <View style={styles.dayRow}>
          {days.map((day) => {
            const active = repeatDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, active && styles.dayChipActive]}
                onPress={() => toggleDay(day)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{day}</Text>
              </TouchableOpacity>
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
        {mode === 'fixed' &&
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
                <View style={[styles.actionBadge]}>
                  <Text style={styles.actionBadgeText}>{active ? '選択中' : '長押しでプレビュー'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {mode === 'random' && (
          <View style={styles.randomNotice}>
            <Text style={styles.actionTitle}>ランダムアクション</Text>
            <Text style={styles.randomHelper}>計算 / シェイク / 証拠ショットの3種類からランダムに出題されます。</Text>
          </View>
        )}



        <Text style={styles.label}>アラーム音量</Text>
        <View style={styles.volumeCard}>
          <Text style={styles.volumeValue}>{formatAlarmVolume(volume)}</Text>
          <View style={styles.volumeButtonRow}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => setVolume((current) => normalizeAlarmVolume(current - ALARM_VOLUME_STEP))}
              activeOpacity={0.85}
            >
              <Text style={styles.volumeButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => setVolume((current) => normalizeAlarmVolume(current + ALARM_VOLUME_STEP))}
              activeOpacity={0.85}
            >
              <Text style={styles.volumeButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.volumeHelp}>発火中だけ端末のアラーム音量へ反映します</Text>
        </View>

        <Text style={styles.label}>メモ</Text>
        <TextInput
          style={styles.noteBox}
          placeholder="例: 英語プレゼン用アラーム"
          placeholderTextColor={theme.textSecondary}
          value={memo}
          onChangeText={setMemo}
          multiline={true}
          editable={true}
        />

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>保存</Text>
        </TouchableOpacity>
        {alarm?.id && onDelete && (
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.9} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>削除</Text>
          </TouchableOpacity>
        )}
      </KeyboardAwareScrollView>
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
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  timeInputWrapper: {
    alignSelf: 'flex-start'
  },
  timeInput: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: palette.sunrise,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 72,
    lineHeight: 90,
    fontWeight: '700',
    color: palette.black,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    width: 150
  },
  timeValueDisplay: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.sunrise,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: 'center'
  },
  timeValueText: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.sunrise
  },
  timeColon: {
    fontSize: 40,
    fontWeight: '700',
    color: palette.black
  },
  digitPickerWrapper: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  digitPickersRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  digitPickerContainer: {
    flex: 1
  },
  digitPickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    textAlign: 'center'
  },
  digitPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6
  },
  keypadContainer: {
    alignItems: 'center'
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12
  },
  keypadButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: theme.divider,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3
  },
  keypadButtonSelected: {
    backgroundColor: palette.sunrise,
    borderColor: palette.sunrise,
    shadowOpacity: 0.25,
    elevation: 5
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary
  },
  keypadButtonTextSelected: {
    color: palette.white
  },
  digitButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: theme.divider,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  digitButtonSelected: {
    backgroundColor: palette.sunrise,
    borderColor: palette.sunrise,
    shadowOpacity: 0.2
  },
  digitButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary
  },
  digitButtonTextSelected: {
    color: palette.white
  },
  digitPickerCloseButton: {
    backgroundColor: palette.sunrise,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  digitPickerCloseButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  },
  timePickerGridContainer: {
    marginBottom: 12
  },
  timePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  timePickerGridItem: {
    width: '15.5%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.divider,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  timePickerGridItemSelected: {
    backgroundColor: palette.sunrise,
    borderColor: palette.sunrise,
    shadowOpacity: 0.2,
    elevation: 4
  },
  timePickerGridText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary
  },
  timePickerGridTextSelected: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700'
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
  timePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -16,
    gap: 12
  },
  timePickerContainer: {
    flex: 1,
    height: 220,
    position: 'relative',
    overflow: 'hidden'
  },
  timePickerScroll: {
    flex: 1
  },
  timePickerGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: theme.background,
    zIndex: 10,
    pointerEvents: 'none'
  },
  timePickerGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: theme.background,
    zIndex: 10,
    pointerEvents: 'none'
  },
  timePickerItem: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '300',
    color: palette.ink,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  timePickerItemSelected: {
    color: palette.white,
    backgroundColor: palette.sunrise,
    fontSize: 42,
    fontWeight: '600',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    overflow: 'hidden'
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center'
  },
  timePickerHighlight: {
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.sunrise
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    /*千田修正箇所（文字幅の調節）曜日 */
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,

    /*-- 千田修正箇所　（曜日ボタンと時間調整ボタンとの距離調整） --*/
    marginTop:20,
  },
  dayChip: {//曜日ボタンのデザイン
    borderRadius: 20,

    width:'13%',
    height:36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.divider,
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
  volumeCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    padding: 16
  },
  volumeValue: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center'
  },
  volumeButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14
  },
  volumeButton: {
    flex: 1,
    backgroundColor: palette.sunrise,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  volumeButtonText: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26
  },
  volumeHelp: {
    color: theme.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center'
  },
  noteBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    backgroundColor: theme.card,
    padding: 16,
    minHeight: 100,
    marginBottom: 16,
    fontSize: 16,
    color: theme.textPrimary,
    fontFamily: 'System'
  },
  noteText: {
    color: theme.textSecondary,
    lineHeight: 20
  },
  primaryButton: {
    backgroundColor: palette.sunrise,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: palette.sunrise,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700'
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3B4B4',
    shadowColor: '#C92B2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  deleteButtonText: {
    color: '#C92B2B',
    fontSize: 15,
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
  },
  requirementCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
    padding: 16,
    marginTop: 8
  },
  requirementTitle: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  requirementText: {
    color: theme.textSecondary,
    marginTop: 6,
    lineHeight: 20
  },
  requirementFootnote: {
    color: palette.sunriseDark,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18
  }
});

const twoDigit = (value: number) => value.toString().padStart(2, '0');

export default EditorScreen;
