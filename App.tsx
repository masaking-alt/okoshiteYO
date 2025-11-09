import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ActionPreviewScreen from './src/screens/ActionPreviewScreen';
import AlarmDemoScreen from './src/screens/AlarmDemoScreen';
import { alarmsMock } from './src/data/alarms';
import { Alarm, AlarmAction } from './src/types';
import { theme } from './src/theme/colors';

type Screen = 'home' | 'editor' | 'settings' | 'preview' | 'demo';
type DemoMode = AlarmAction | 'random';

const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(alarmsMock);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | undefined>(alarmsMock[0]);
  const [defaultAction, setDefaultAction] = useState<AlarmAction>('math');
  const [previewAction, setPreviewAction] = useState<AlarmAction>('math');
  const [actionMode, setActionMode] = useState<'fixed' | 'random'>('random');
  const [demoMode, setDemoMode] = useState<DemoMode>('random');

  const openPreview = (action: AlarmAction) => {
    setPreviewAction(action);
    setScreen('preview');
  };

  const toggleAlarm = (alarmId: string, enabled: boolean) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === alarmId ? { ...alarm, active: enabled } : alarm)));
  };

  const saveAlarm = (updated: Alarm) => {
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

  const openDemo = (mode: DemoMode) => {
    setDemoMode(mode);
    setScreen('demo');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

      {screen === 'preview' && <ActionPreviewScreen action={previewAction} onBack={() => setScreen('home')} />}

      {screen === 'demo' && <AlarmDemoScreen mode={demoMode} onComplete={() => setScreen('home')} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background
  }
});

export default App;
