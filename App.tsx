import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, DeviceEventEmitter, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlarmDemoScreen from './src/screens/AlarmDemoScreen';
import { alarmsMock } from './src/data/alarms';
import { Alarm, AlarmAction } from './src/types';
import {
  AlarmFirePayload,
  buildScheduleInput,
  buildScheduleInputFromPayload,
  cancelAlarm,
  canScheduleExactAlarms,
  coerceFireMode,
  ensureNotificationPermission,
  openExactAlarmSettings,
  openNotificationSettings,
  scheduleAlarm,
  stopAlarm
} from './src/services/alarmScheduler';
import { theme } from './src/theme/colors';

type Screen = 'home' | 'editor' | 'settings' | 'demo' | 'alarm';
type DemoMode = AlarmAction | 'random';
type AppProps = { alarm?: AlarmFirePayload };
const RANDOM_MODES: AlarmAction[] = ['math', 'shake', 'photo'];
const ALARMS_STORAGE_KEY = 'alarms_storage_v1';

const App: React.FC<AppProps> = ({ alarm }) => {
  const [alarms, setAlarms] = useState<Alarm[]>(alarmsMock);
  const [alarmsLoaded, setAlarmsLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>(() => (alarm ? 'alarm' : 'home'));
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | undefined>(alarmsMock[0]);
  const [defaultAction, setDefaultAction] = useState<AlarmAction>('math');
  const [actionMode, setActionMode] = useState<'fixed' | 'random'>('random');
  const [demoMode, setDemoMode] = useState<DemoMode>('random');
  const [alarmPayload, setAlarmPayload] = useState<AlarmFirePayload | null>(() => alarm ?? null);
  const [alarmResolvedMode, setAlarmResolvedMode] = useState<AlarmAction | null>(() => {
    if (!alarm) {
      return null;
    }
    const mode = coerceFireMode(alarm.mode);
    return mode === 'random' ? pickRandomMode() : mode;
  });

  const openPreview = (action: AlarmAction) => {
    setDemoMode(action);
    setScreen('demo');
  };

  const handleIncomingAlarm = useCallback((payload?: AlarmFirePayload | null) => {
    if (!payload?.alarm_id) {
      return;
    }
    setAlarmPayload((prev) => {
      if (prev?.alarm_id === payload.alarm_id && prev?.time === payload.time) {
        return prev;
      }
      return payload;
    });
    setScreen('alarm');
  }, []);

  useEffect(() => {
    let active = true;
    const loadAlarms = async () => {
      try {
        const stored = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
        if (!active) {
          return;
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAlarms(parsed as Alarm[]);
          } else {
            setAlarms(alarmsMock);
          }
        } else {
          setAlarms(alarmsMock);
        }
      } catch (error) {
        console.warn('Failed to load alarms', error);
        if (active) {
          setAlarms(alarmsMock);
        }
      } finally {
        if (active) {
          setAlarmsLoaded(true);
        }
      }
    };
    loadAlarms();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!alarmsLoaded) {
      return;
    }
    AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms)).catch((error) => {
      console.warn('Failed to persist alarms', error);
    });
  }, [alarms, alarmsLoaded]);

  const ensureSchedulePermissions = async () => {
    const exactAllowed = await canScheduleExactAlarms();
    if (!exactAllowed) {
      Alert.alert('正確なアラームが必要', '正確なアラーム権限が無いと保存できません。', [
        { text: '設定を開く', onPress: () => openExactAlarmSettings() },
        { text: 'キャンセル', style: 'cancel' }
      ]);
      return false;
    }
    const notificationsAllowed = await ensureNotificationPermission();
    if (!notificationsAllowed) {
      Alert.alert('通知の許可が必要', '通知権限が無いと保存できません。', [
        { text: '設定を開く', onPress: () => openNotificationSettings() },
        { text: 'キャンセル', style: 'cancel' }
      ]);
      return false;
    }
    return true;
  };

  const scheduleAlarmFor = async (alarmData: Alarm) => {
    try {
      const scheduledAt = await scheduleAlarm(buildScheduleInput(alarmData));
      if (!scheduledAt) {
        Alert.alert('アラーム設定に失敗しました');
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Failed to schedule alarm', error);
      Alert.alert('アラーム設定に失敗しました');
      return false;
    }
  };

  const toggleAlarm = async (alarmId: string, enabled: boolean) => {
    const target = alarms.find((item) => item.id === alarmId);
    if (!target) {
      return;
    }
    if (enabled) {
      const allowed = await ensureSchedulePermissions();
      if (!allowed) {
        return;
      }
      const ok = await scheduleAlarmFor({ ...target, active: true });
      if (!ok) {
        return;
      }
    } else {
      try {
        const canceled = await cancelAlarm(alarmId);
        if (!canceled) {
          Alert.alert('アラーム停止に失敗しました');
        }
      } catch (error) {
        console.warn('Failed to cancel alarm', error);
        Alert.alert('アラーム停止に失敗しました');
      }
    }
    setAlarms((prev) => prev.map((alarm) => (alarm.id === alarmId ? { ...alarm, active: enabled } : alarm)));
  };

  const saveAlarm = async (updated: Alarm) => {
    // 既存アラームの場合、キャンセルしてから再スケジュール
    if (updated.id && updated.id !== Date.now().toString()) {
      try {
        await cancelAlarm(updated.id);
      } catch (error) {
        console.warn('Failed to cancel previous alarm', error);
      }
    }

    if (updated.active) {
      const allowed = await ensureSchedulePermissions();
      if (!allowed) {
        console.warn('Permission check failed');
        // 権限がなくても、無効状態で保存できるようにする
        updated = { ...updated, active: false };
      } else {
        const ok = await scheduleAlarmFor(updated);
        if (!ok) {
          console.warn('Schedule alarm failed');
          // スケジューリング失敗時も無効状態で保存
          updated = { ...updated, active: false };
        }
      }
    }

    setAlarms((prev) => {
      const exists = prev.some((alarm) => alarm.id === updated.id);
      if (exists) {
        return prev.map((alarm) => (alarm.id === updated.id ? updated : alarm));
      }
      return [...prev, updated];
    });
    setSelectedAlarm(updated);
    setScreen('home');
  };

  const deleteAlarm = async (alarmId: string) => {
    try {
      await cancelAlarm(alarmId);
    } catch (error) {
      console.warn('Failed to cancel alarm', error);
    }
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId));
    if (selectedAlarm?.id === alarmId) {
      setSelectedAlarm(undefined);
    }
    setScreen('home');
  };

  const openDemo = (mode: DemoMode) => {
    setDemoMode(mode);
    setScreen('demo');
  };

  useEffect(() => {
    if (!alarmPayload) {
      setAlarmResolvedMode(null);
      return;
    }
    const mode = coerceFireMode(alarmPayload.mode);
    setAlarmResolvedMode(mode === 'random' ? pickRandomMode() : mode);
  }, [alarmPayload]);

  useEffect(() => {
    if (alarm) {
      handleIncomingAlarm(alarm);
    }
  }, [alarm, handleIncomingAlarm]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('AlarmFired', (payload) => {
      handleIncomingAlarm(payload as AlarmFirePayload);
    });
    return () => {
      subscription.remove();
    };
  }, [handleIncomingAlarm]);

  useEffect(() => {
    const onBackPress = () => {
      if (screen === 'home') {
        return false;
      }
      if (screen === 'editor' || screen === 'settings' || screen === 'demo') {
        setScreen('home');
        return true;
      }
      if (screen === 'alarm') {
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [screen]);

  const completeAlarm = async () => {
    await stopAlarm();
    const reschedule = alarmPayload ? buildScheduleInputFromPayload(alarmPayload) : null;
    if (reschedule && reschedule.repeatDays.length > 0) {
      try {
        await scheduleAlarm(reschedule);
      } catch (error) {
        console.warn('Failed to reschedule alarm', error);
      }
    }
    setAlarmPayload(null);
    setScreen('home');
  };

  const fireTime = alarmPayload?.time ?? '05:30';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" />
      {screen === 'home' && (
        <HomeScreen
          alarms={[...alarms].sort((a, b) => a.time.localeCompare(b.time))}
          onCreate={() => {
            setSelectedAlarm(undefined);
            setScreen('editor');
          }}
          onEdit={(alarm) => {
            setSelectedAlarm(alarm);
            setScreen('editor');
          }}
          onOpenSettings={() => setScreen('settings')}
          onToggle={toggleAlarm}
        />
      )}

      {screen === 'editor' && (
        <EditorScreen
          alarm={selectedAlarm}
          onBack={() => setScreen('home')}
          onPreviewAction={openPreview}
          onSave={saveAlarm}
          onDelete={deleteAlarm}
          defaultAction={defaultAction}
          defaultMode={actionMode}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          currentAction={defaultAction}
          onSelectAction={(action) => {
            setDefaultAction(action);
          }}
          onClose={() => setScreen('home')}
          onPreviewAction={openPreview}
          actionMode={actionMode}
          onChangeMode={setActionMode}
          onShowDemo={openDemo}
        />
      )}

      {screen === 'demo' && <AlarmDemoScreen mode={demoMode} onComplete={() => setScreen('home')} />}

      {screen === 'alarm' && alarmResolvedMode && (
        <AlarmDemoScreen mode={alarmResolvedMode} time={fireTime} onComplete={completeAlarm} />
      )}

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const pickRandomMode = (): AlarmAction => {
  return RANDOM_MODES[Math.floor(Math.random() * RANDOM_MODES.length)];
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background
  }
});

export default App;
