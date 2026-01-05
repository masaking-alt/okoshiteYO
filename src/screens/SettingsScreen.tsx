import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
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
  const [permissionState, setPermissionState] = useState<PermissionStateMap>({
    exact: 'needs',
    notification: 'needs',
    dnd: 'needs',
    battery: 'info'
  });

  const togglePermission = (key: PermissionKey) => {
    setPermissionState((prev) => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'needs' : 'granted'
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>設定</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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

        <Text style={styles.sectionLabel}>権限とシステム設定</Text>
        {permissionItems(permissionState).map((item) => (
          <View key={item.key} style={styles.rowCard}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.description}</Text>
              <Text style={styles.helperText}>※ ネイティブ実装と連携して実際の状態を反映</Text>
            </View>
            <View style={styles.statusColumn}>
              <StatusPill state={item.state} />
              <TouchableOpacity style={styles.secondaryButton} onPress={() => togglePermission(item.key)}>
                <Text style={styles.secondaryButtonText}>{item.cta}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>通知 & サウンド</Text>
        <View style={styles.rowCard}>
          <View>
            <Text style={styles.rowTitle}>端末のデフォルトアラーム音</Text>
            <Text style={styles.rowSubtitle}>RingtoneManager で取得。権限不要。</Text>
          </View>
          <StatusPill state="granted" label="利用中" />
        </View>
        <View style={styles.rowCard}>
          <View>
            <Text style={styles.rowTitle}>端末内の音源を選ぶ</Text>
            <Text style={styles.rowSubtitle}>SAF (ACTION_OPEN_DOCUMENT) で音源を指定。外部ストレージ権限不要。</Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => onShowDemo('random')}>
            <Text style={styles.secondaryButtonText}>選択UIを開く</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>その他</Text>
        <View style={styles.rowCard}>
          <View>
            <Text style={styles.rowTitle}>絶対起動モード</Text>
            <Text style={styles.rowSubtitle}>バイブ + 最大音量 + フルスクリーン。DND貫通を前提。</Text>
          </View>
          <View style={styles.fakeSwitch}>
            <View style={styles.fakeSwitchDot} />
          </View>
        </View>
        <View style={styles.rowCard}>
          <View>
            <Text style={styles.rowTitle}>統計を記録</Text>
            <Text style={styles.rowSubtitle}>解除時間を記録して週次レポートを表示（将来対応）。</Text>
          </View>
          <View style={[styles.fakeSwitch, { backgroundColor: 'transparent', borderColor: theme.divider }]}>
            <View style={[styles.fakeSwitchDot, { backgroundColor: theme.divider, marginLeft: 0 }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.demoButton} activeOpacity={0.9} onPress={() => onShowDemo('random')}>
          <Text style={styles.demoText}>デモ画面を再生</Text>
        </TouchableOpacity>
      </ScrollView>
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

type PermissionState = 'needs' | 'granted' | 'warn';
type PermissionKey = 'exact' | 'notification' | 'dnd' | 'battery';
type PermissionStateMap = Record<PermissionKey, PermissionState | 'info'>;

const permissionItems = (state: PermissionStateMap) =>
  [
    {
      key: 'exact' as PermissionKey,
      title: '正確なアラーム',
      description: 'SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM を許可。許可なしは保存をブロック。',
      cta: '状態確認',
      state: state.exact
    },
    {
      key: 'notification' as PermissionKey,
      title: '通知 (POST_NOTIFICATIONS)',
      description: 'API33+ で runtime 権限。拒否時はアラーム作成をブロック。',
      cta: '確認',
      state: state.notification
    },
    {
      key: 'dnd' as PermissionKey,
      title: 'おやすみモードを貫通',
      description: 'ACCESS_NOTIFICATION_POLICY を設定アプリで許可。拒否時は DND 中に鳴らないことを明示。',
      cta: '設定を開く',
      state: state.dnd
    },
    {
      key: 'battery' as PermissionKey,
      title: 'バッテリー最適化の除外',
      description: '遅延が疑われるときだけ ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS へ誘導。',
      cta: '案内する',
      state: state.battery
    }
  ] as const;

const StatusPill = ({ state, label }: { state: PermissionState | 'info'; label?: string }) => {
  const text = label ?? statusLabel(state);
  return <Text style={[styles.statusPill, statusStyle(state)]}>{text}</Text>;
};

const statusLabel = (state: PermissionState | 'info') => {
  switch (state) {
    case 'granted':
      return '許可済み';
    case 'warn':
      return '要確認';
    case 'needs':
      return '未許可';
    default:
      return '案内のみ';
  }
};

const statusStyle = (state: PermissionState | 'info') => {
  switch (state) {
    case 'granted':
      return { backgroundColor: palette.mint, color: palette.white };
    case 'warn':
      return { backgroundColor: palette.lavender, color: palette.white };
    case 'needs':
      return { backgroundColor: palette.sunrise, color: palette.white };
    default:
      return { backgroundColor: theme.cardMuted, color: theme.textPrimary };
  }
};

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
  },
  helperText: {
    color: theme.textSecondary,
    fontSize: 12
  },
  statusColumn: {
    alignItems: 'flex-end'
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderColor: palette.sunrise,
    borderWidth: 1
  },
  secondaryButtonText: {
    color: palette.sunrise,
    fontWeight: '700',
    fontSize: 12
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12
  }
});

export default SettingsScreen;
