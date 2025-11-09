import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { AlarmAction } from '../types';
import { palette, theme } from '../theme/colors';

interface Props {
  currentAction: AlarmAction;
  onSelectAction: (action: AlarmAction) => void;
  onClose: () => void;
  onPreviewAction: (action: AlarmAction) => void;
  actionMode: 'fixed' | 'random';
  onChangeMode: (mode: 'fixed' | 'random') => void;
  onShowDemo: (mode: 'random' | AlarmAction) => void;
}

const SettingsScreen: React.FC<Props> = ({
  currentAction,
  onSelectAction,
  onClose,
  onPreviewAction,
  actionMode,
  onChangeMode,
  onShowDemo
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>設定</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.sectionLabel}>アクションモード</Text>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, actionMode === 'fixed' && styles.modeChipActive]}
          onPress={() => onChangeMode('fixed')}
        >
          <Text style={[styles.modeChipText, actionMode === 'fixed' && styles.modeChipTextActive]}>選択制</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, actionMode === 'random' && styles.modeChipActive]}
          onPress={() => onChangeMode('random')}
        >
          <Text style={[styles.modeChipText, actionMode === 'random' && styles.modeChipTextActive]}>ランダム</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>デフォルトの解除アクション</Text>
      {(['math', 'shake', 'photo'] as AlarmAction[]).map((action) => {
        const active = action === currentAction;
        return (
          <TouchableOpacity
            key={action}
            style={[styles.rowCard, active && styles.rowCardActive]}
            onPress={() => onSelectAction(action)}
            onLongPress={() => onPreviewAction(action)}
          >
            <View>
              <Text style={styles.rowTitle}>{titleFor(action)}</Text>
              <Text style={styles.rowSubtitle}>{subtitleFor(action)}</Text>
            </View>
            <Text style={[styles.rowStatus, active && styles.rowStatusActive]}>{active ? '使用中' : '長押しでプレビュー'}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionLabel}>通知 & サウンド</Text>
      <View style={styles.rowCard}>
        <View>
          <Text style={styles.rowTitle}>絶対起動モード</Text>
          <Text style={styles.rowSubtitle}>バイブ + 最大音量で起床を確実に</Text>
        </View>
        <View style={styles.fakeSwitch}>
          <View style={styles.fakeSwitchDot} />
        </View>
      </View>
      <View style={styles.rowCard}>
        <View>
          <Text style={styles.rowTitle}>統計を記録</Text>
          <Text style={styles.rowSubtitle}>解除時間を記録して週次レポートを表示</Text>
        </View>
      <View
        style={[styles.fakeSwitch, { backgroundColor: 'transparent', borderColor: theme.divider }]}
      >
        <View style={[styles.fakeSwitchDot, { backgroundColor: theme.divider, marginLeft: 0 }]} />
      </View>
      </View>

      <TouchableOpacity style={styles.demoButton} activeOpacity={0.9} onPress={() => onShowDemo('random')}>
        <Text style={styles.demoText}>デモ画面を再生</Text>
      </TouchableOpacity>
    </View>
  );
};

const titleFor = (action: AlarmAction) => {
  switch (action) {
    case 'math':
      return '計算チャレンジ';
    case 'shake':
      return 'シェイク解除';
    case 'photo':
      return '証拠ショット';
    default:
      return 'カスタムアクション';
  }
};

const subtitleFor = (action: AlarmAction) => {
  switch (action) {
    case 'math':
      return '寝ぼけ頭を一気に起こす問題';
    case 'shake':
      return '体を動かして強制的に覚醒';
    case 'photo':
      return '登録スポットに移動しないと解除不可';
    default:
      return '';
  }
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
    justifyContent: 'space-between'
  },
  backText: {
    color: theme.textPrimary,
    fontSize: 22
  },
  toolbarTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '600'
  },
  sectionLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 12
  },
  rowCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.divider,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowCardActive: {
    borderColor: palette.sunrise
  },
  rowTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  rowSubtitle: {
    color: theme.textSecondary,
    marginTop: 6,
    width: 220
  },
  rowStatus: {
    color: theme.textSecondary,
    fontSize: 12
  },
  rowStatusActive: {
    color: palette.sunrise,
    fontWeight: '700'
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12
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
    backgroundColor: theme.card,
    borderColor: palette.sunrise
  },
  modeChipText: {
    color: theme.textSecondary,
    fontWeight: '600'
  },
  modeChipTextActive: {
    color: palette.sunriseDark
  },
  fakeSwitch: {
    width: 52,
    height: 28,
    borderRadius: 999,
    backgroundColor: palette.sunrise,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: palette.sunrise
  },
  fakeSwitchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.white,
    marginLeft: 16
  },
  demoButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: palette.sunrise,
    alignItems: 'center'
  },
  demoText: {
    color: palette.white,
    fontWeight: '700'
  }
});

export default SettingsScreen;
