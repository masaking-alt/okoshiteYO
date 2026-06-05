import React from 'react';
import { FlatList, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, FAB, Surface, Text } from 'react-native-paper';
import { Alarm } from '../types';
import { AlarmCard } from '../components/AlarmCard';
import { theme } from '../theme/colors';

interface Props {
  alarms: Alarm[];
  onCreate: () => void;
  onEdit: (alarm: Alarm) => void;
  onOpenSettings: () => void;
  onToggle: (alarmId: string, enabled: boolean) => void;
}

const HomeScreen: React.FC<Props> = ({ alarms, onCreate, onEdit, onOpenSettings, onToggle }) => {
  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" statusBarHeight={appbarStatusBarHeight} style={styles.appbar}>
        <Appbar.Content title="おこしてYO!" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="cog-outline" onPress={onOpenSettings} />
      </Appbar.Header>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onPress={() => onEdit(item)}
            onToggle={(enabled) => onToggle(item.id, enabled)}
            mode={item.mode ?? 'fixed'}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, alarms.length === 0 && styles.emptyListContent]}
        ListHeaderComponent={
          alarms.length > 0 ? (
            <Text variant="labelLarge" style={styles.sectionLabel}>
              アラーム
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <Surface mode="flat" elevation={0} style={styles.emptyState}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              アラームなし
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              右下のボタンから最初のアラームを追加できます。
            </Text>
          </Surface>
        }
      />

      <FAB icon="plus" label="追加" style={styles.fab} onPress={onCreate} />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 112
  },
  emptyListContent: {
    flexGrow: 1
  },
  sectionLabel: {
    color: theme.textSecondary,
    marginBottom: 12,
    marginTop: 8
  },
  emptyState: {
    marginTop: 72,
    padding: 24,
    borderRadius: 28,
    backgroundColor: theme.cardMuted,
    alignItems: 'center'
  },
  emptyTitle: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28
  }
});

export default HomeScreen;
