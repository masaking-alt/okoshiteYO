import React from 'react';
import { Alert, Linking, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Card, Divider, IconButton, RadioButton, SegmentedButtons, Text } from 'react-native-paper';
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

const actionOptions: { key: AlarmAction; title: string; subtitle: string; icon: string }[] = [
  { key: 'math', title: '計算チャレンジ', subtitle: '計算を3問解いて解除', icon: 'calculator-variant-outline' },
  { key: 'shake', title: 'シェイク解除', subtitle: 'スマホを50回振って解除', icon: 'gesture-tap-button' },
  { key: 'photo', title: '証拠ショット', subtitle: '指定された物を撮影して解除', icon: 'camera-outline' }
];

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
      <Appbar.Header mode="center-aligned" statusBarHeight={appbarStatusBarHeight} style={styles.appbar}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title="設定" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          解除モード
        </Text>
        <SegmentedButtons
          value={actionMode}
          onValueChange={(value: string) => onChangeMode(value as 'fixed' | 'random')}
          buttons={[
            { value: 'fixed', label: '選択制', icon: 'target' },
            { value: 'random', label: 'ランダム', icon: 'shuffle-variant' }
          ]}
        />
        <Text variant="bodySmall" style={styles.helperText}>
          選択制では下のアクションを固定し、ランダムでは解除時に毎回自動で選びます。
        </Text>

        <Button
          mode="contained-tonal"
          icon="play-circle-outline"
          style={styles.previewButton}
          onPress={() => onShowDemo(actionMode === 'random' ? 'random' : currentAction)}
        >
          解除プレビューを開始
        </Button>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          解除アクション
        </Text>
        {actionOptions.map((action) => {
          const active = action.key === currentAction;
          return (
            <Card
              key={action.key}
              mode={active ? 'elevated' : 'outlined'}
              style={[styles.actionCard, active && styles.actionCardActive]}
              onPress={() => onSelectAction(action.key)}
              onLongPress={() => onPreviewAction(action.key)}
            >
              <Card.Content style={styles.actionContent}>
                <Avatar.Icon
                  size={44}
                  icon={action.icon}
                  color={active ? theme.card : palette.sunriseDark}
                  style={[styles.actionIcon, active && styles.actionIconActive]}
                />
                <View style={styles.actionTextColumn}>
                  <Text variant="titleSmall" style={styles.actionTitle}>
                    {action.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.actionSubtitle}>
                    {action.subtitle}
                  </Text>
                  <Text variant="labelSmall" style={styles.previewHint}>
                    長押しで個別プレビュー
                  </Text>
                </View>
                <RadioButton.Android
                  value={action.key}
                  status={active ? 'checked' : 'unchecked'}
                  onPress={() => onSelectAction(action.key)}
                  color={palette.sunriseDark}
                />
              </Card.Content>
            </Card>
          );
        })}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          証拠ショット
        </Text>
        <Card mode="outlined" style={styles.navigationCard} onPress={onOpenPhotoTargets}>
          <Card.Title
            title="証拠ショットの対象物"
            subtitle="最低3つ以上をONにします"
            left={() => <Avatar.Icon size={40} icon="image-filter-center-focus" />}
            right={() => <IconButton icon="chevron-right" onPress={onOpenPhotoTargets} />}
          />
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          権限と端末設定
        </Text>
        <Card mode="outlined" style={styles.permissionCard}>
          <Card.Content style={styles.permissionContent}>
            <Button mode="contained-tonal" icon="bell-outline" onPress={requestNotifications}>
              通知を確認
            </Button>
            <Divider />
            <Button mode="outlined" icon="alarm-check" onPress={() => openExactAlarmSettings()}>
              正確なアラーム設定
            </Button>
            <Button mode="outlined" icon="minus-circle-outline" onPress={() => openDndSettings()}>
              おやすみモード設定
            </Button>
            <Button mode="outlined" icon="cog-outline" onPress={openAppSettings}>
              アプリ設定
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const appbarStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

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
  sectionTitle: {
    color: theme.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 24
  },
  helperText: {
    color: theme.textSecondary,
    marginTop: 10,
    lineHeight: 18
  },
  previewButton: {
    marginTop: 16
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
  actionIcon: {
    backgroundColor: theme.accentSoft
  },
  actionIconActive: {
    backgroundColor: palette.sunriseDark
  },
  actionTextColumn: {
    flex: 1
  },
  actionTitle: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  actionSubtitle: {
    color: theme.textSecondary,
    marginTop: 3
  },
  previewHint: {
    color: palette.sunriseDark,
    marginTop: 6
  },
  navigationCard: {
    backgroundColor: theme.card
  },
  permissionCard: {
    backgroundColor: theme.card
  },
  permissionContent: {
    gap: 12
  }
});

export default SettingsScreen;
