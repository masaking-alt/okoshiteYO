import React from 'react';
import { Alert, FlatList, Image, PixelRatio, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Badge, Button, Card, Surface, Switch, Text } from 'react-native-paper';
import { getAllPhotoTargetLabels, getJapanesePhotoTargetLabel, PHOTO_TARGETS, PhotoTargetLabel } from '../data/photoTargets';
import { palette, theme } from '../theme/colors';

const MIN_ENABLED_PHOTO_TARGETS = 3;
const TARGET_ICON_SIZE = PixelRatio.roundToNearestPixel(44);

const TARGET_ICONS: Record<PhotoTargetLabel, number> = {
  scissors: require('../../assets/icons/scissors.png'),
  keyboard: require('../../assets/icons/keyboard.png'),
  mouse: require('../../assets/icons/mouse.png'),
  bottle: require('../../assets/icons/bottle.png'),
  remote: require('../../assets/icons/remote.png'),
  book: require('../../assets/icons/book.png'),
  cup: require('../../assets/icons/cup.png'),
  laptop: require('../../assets/icons/laptop.png'),
  tv: require('../../assets/icons/tv.png'),
  chair: require('../../assets/icons/chair.png'),
  couch: require('../../assets/icons/couch.png'),
  'dining table': require('../../assets/icons/dining_table.png'),
  'potted plant': require('../../assets/icons/potted_plant.png'),
  clock: require('../../assets/icons/clock.png'),
  vase: require('../../assets/icons/vase.png'),
  bowl: require('../../assets/icons/bowl.png'),
  spoon: require('../../assets/icons/spoon.png'),
  fork: require('../../assets/icons/fork.png')
};

type Props = {
  enabledPhotoTargets: PhotoTargetLabel[];
  onChangeEnabledPhotoTargets: (next: PhotoTargetLabel[]) => void;
  onBack: () => void;
};

const PhotoTargetsScreen: React.FC<Props> = ({ enabledPhotoTargets, onChangeEnabledPhotoTargets, onBack }) => {
  const toggle = (label: PhotoTargetLabel) => {
    const isEnabled = enabledPhotoTargets.includes(label);
    if (isEnabled) {
      const next = enabledPhotoTargets.filter((item) => item !== label);
      if (next.length < MIN_ENABLED_PHOTO_TARGETS) {
        Alert.alert('最低3つはONにしてください', '解除の難易度を保つため、対象は最低3つ必要です。');
        return;
      }
      onChangeEnabledPhotoTargets(next);
      return;
    }

    const set = new Set<PhotoTargetLabel>(enabledPhotoTargets);
    set.add(label);
    const next = PHOTO_TARGETS.map((target) => target.en).filter((item) => set.has(item));
    onChangeEnabledPhotoTargets(next);
  };

  const resetAll = () => {
    onChangeEnabledPhotoTargets(getAllPhotoTargetLabels());
    Alert.alert('対象を全てONに戻しました');
  };

  const renderItem = ({ item }: { item: (typeof PHOTO_TARGETS)[number] }) => {
    const enabled = enabledPhotoTargets.includes(item.en);

    return (
      <Card
        mode={enabled ? 'elevated' : 'outlined'}
        style={[styles.gridCard, enabled ? styles.gridCardEnabled : styles.gridCardDisabled]}
        onPress={() => toggle(item.en)}
      >
        <Card.Content style={styles.gridContent}>
          <Badge visible={enabled} style={styles.checkBadge}>
            ON
          </Badge>
          <Image
            style={[styles.targetIcon, { width: TARGET_ICON_SIZE, height: TARGET_ICON_SIZE }]}
            source={TARGET_ICONS[item.en]}
            resizeMode="contain"
          />
          <Text variant="titleSmall" style={styles.gridTitle} numberOfLines={2}>
            {getJapanesePhotoTargetLabel(item.en)}
          </Text>
          <Text variant="labelSmall" style={styles.gridSubtitle} numberOfLines={1}>
            {item.en}
          </Text>
          <Switch value={enabled} onValueChange={() => toggle(item.en)} color={palette.sunriseDark} />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned" statusBarHeight={appbarStatusBarHeight} style={styles.appbar}>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="証拠ショット" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <FlatList
        data={PHOTO_TARGETS}
        renderItem={renderItem}
        keyExtractor={(item) => item.en}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <Surface mode="flat" style={styles.headerSurface}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              対象物を選択
            </Text>
            <Text variant="bodySmall" style={styles.helperText}>
              指定される物をON/OFFできます。最低{MIN_ENABLED_PHOTO_TARGETS}つはONにしてください。
            </Text>
            <Text variant="labelLarge" style={styles.counterText}>
              ON中: {enabledPhotoTargets.length} / {PHOTO_TARGETS.length}
            </Text>
          </Surface>
        }
        ListFooterComponent={
          <Button mode="outlined" icon="restore" style={styles.resetButton} onPress={resetAll}>
            全てONに戻す
          </Button>
        }
      />
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
  headerSurface: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.cardMuted,
    marginBottom: 16
  },
  headerTitle: {
    color: theme.textPrimary,
    fontWeight: '700'
  },
  helperText: {
    color: theme.textSecondary,
    marginTop: 6,
    lineHeight: 18
  },
  counterText: {
    color: palette.sunriseDark,
    marginTop: 12
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12
  },
  gridCard: {
    width: '48%',
    minHeight: 184,
    backgroundColor: theme.card
  },
  gridCardEnabled: {
    backgroundColor: theme.accentSoft
  },
  gridCardDisabled: {
    opacity: 0.68
  },
  gridContent: {
    minHeight: 184,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 6
  },
  checkBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: palette.sunriseDark
  },
  targetIcon: {
    marginBottom: 6
  },
  gridTitle: {
    color: theme.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 40
  },
  gridSubtitle: {
    color: theme.textSecondary,
    textAlign: 'center'
  },
  resetButton: {
    marginTop: 18
  }
});

export default PhotoTargetsScreen;
