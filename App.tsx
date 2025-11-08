import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ActionPreviewScreen from './src/screens/ActionPreviewScreen';
import { alarmsMock } from './src/data/alarms';
import { Alarm, AlarmAction } from './src/types';
import { theme } from './src/theme/colors';

type Screen = 'home' | 'editor' | 'settings' | 'preview';

const App: React.FC = () => {
  const [alarms] = useState<Alarm[]>(alarmsMock);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | undefined>(alarmsMock[0]);
  const [defaultAction, setDefaultAction] = useState<AlarmAction>('math');
  const [previewAction, setPreviewAction] = useState<AlarmAction>('math');

  const upcomingAlarm = useMemo(() => alarms.find((alarm) => alarm.active) ?? alarms[0], [alarms]);

  const openPreview = (action: AlarmAction) => {
    setPreviewAction(action);
    setScreen('preview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {screen === 'home' && (
        <HomeScreen
          alarms={alarms}
          upcomingAlarm={upcomingAlarm}
          onCreate={() => {
            setSelectedAlarm(undefined);
            setScreen('editor');
          }}
          onEdit={(alarm) => {
            setSelectedAlarm(alarm);
            setScreen('editor');
          }}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'editor' && (
        <EditorScreen alarm={selectedAlarm} onBack={() => setScreen('home')} onPreviewAction={openPreview} />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          currentAction={defaultAction}
          onSelectAction={(action) => {
            setDefaultAction(action);
          }}
          onClose={() => setScreen('home')}
          onPreviewAction={openPreview}
        />
      )}

      {screen === 'preview' && <ActionPreviewScreen action={previewAction} onBack={() => setScreen('home')} />}
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
