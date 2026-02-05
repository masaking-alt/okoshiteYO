import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Alert, Linking } from 'react-native';
import { AlarmAction } from '../types';
import { palette, theme } from '../theme/colors';
import { ensureNotificationPermission, openDndSettings, openExactAlarmSettings, openNotificationSettings } from '../services/alarmScheduler';

interface Props {
  currentAction: AlarmAction;
  onSelectAction: (action: AlarmAction) => void;
  onClose: () => void;
  onPreviewAction: (action: AlarmAction) => void;
  actionMode: 'fixed' | 'random';
  onChangeMode: (mode: 'fixed' | 'random') => void;
  onShowDemo: (mode: 'random' | AlarmAction) => void;
  onOpenPhotoTargets: () => void;
}

const SettingsScreen: React.FC<Props> = ({
  currentAction,
  onSelectAction,
  onClose,
  onPreviewAction,
  actionMode,
  onChangeMode,
  onShowDemo,
  onOpenPhotoTargets
}) => {
  const requestNotifications = async () => {
    try {
      const granted = await ensureNotificationPermission();
      if (granted) {
        Alert.alert('通知を許可しました');
        return;
      }
      Alert.alert('通知が未許可です', '設定画面から通知を許可してください。', [
        { text: '設定を開く', onPress: () => openNotificationSettings() },
        { text: '閉じる', style: 'cancel' }
      ]);
    } catch (error) {
      console.warn('Failed to request notifications permission', error);
      Alert.alert('通知の許可に失敗しました');
    }
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.warn('Failed to open app settings', error);
      Alert.alert('設定を開けませんでした');
    }
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
       
        <Text style={styles.sectionLabel}>解除アクション</Text>
        {(['math', 'shake', 'photo'] as AlarmAction[]).map((action) => {
          const active = action === currentAction;
          return (
            <TouchableOpacity
              key={action}
              style={[styles.rowCard]}
              onPress={() => onSelectAction(action)}
              onLongPress={() => onPreviewAction(action)}
            >
              <View>
                <Text style={styles.rowTitle}>{titleFor(action)}</Text>
                <Text style={styles.rowSubtitle}>{subtitleFor(action)}</Text>
              </View>
              <Text style={[styles.rowStatus]}>
              長押しでプレビュー
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionLabel}>証拠ショット</Text>
        <TouchableOpacity style={styles.rowCard} onPress={onOpenPhotoTargets} activeOpacity={0.85}>
          <View>
            <Text style={styles.rowTitle}>証拠ショットの対象物</Text>
            <Text style={styles.rowSubtitle}>指定される物をON/OFFできます（最低3つはON）</Text>
          </View>
          <Text style={styles.rowStatus}>開く</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>権限と設定</Text>

        <TouchableOpacity style={styles.rowCard} onPress={openAppSettings}>
          <View>
            <Text style={styles.rowTitle}>アプリ設定</Text>
            <Text style={styles.rowSubtitle}>カメラなど個別の権限はここから変更できます</Text>
          </View>
          <Text style={styles.rowStatus}>開く</Text>
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
      return '計算を3問解いて解除';
    case 'shake':
      return 'スマホを50回振って解除';
    case 'photo':
      return '指定された物を撮影して解除';
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
  testButton: {
    marginTop: 12
  },
  stopButton: {
    marginTop: 8,
    backgroundColor: palette.ink
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
