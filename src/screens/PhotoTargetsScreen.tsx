import React from 'react';
import { Alert, FlatList, Image, PixelRatio, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      <TouchableOpacity
        style={[
          styles.gridCard,
          enabled ? styles.gridCardEnabled : styles.gridCardDisabled
        ]}
        onPress={() => toggle(item.en)}
        activeOpacity={0.8}
      >
        <Image
          style={[styles.targetIcon, { width: TARGET_ICON_SIZE, height: TARGET_ICON_SIZE }]}
          source={TARGET_ICONS[item.en]}
          resizeMode="contain"
        />
        <Text style={styles.gridTitle}>{getJapanesePhotoTargetLabel(item.en)}</Text>
        <Text style={[styles.gridSubtitle, enabled ? styles.gridSubtitleEnabled : styles.gridSubtitleDisabled]}>{item.en}</Text>
        {enabled && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>証拠ショットの対象物</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={PHOTO_TARGETS}
        renderItem={renderItem}
        keyExtractor={(item) => item.en}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.helperText}>指定される物をON/OFFできます（最低{MIN_ENABLED_PHOTO_TARGETS}つはON）</Text>
            <Text style={styles.helperText}>
              ON中: {enabledPhotoTargets.length} / {PHOTO_TARGETS.length}
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.secondaryButton} onPress={resetAll} activeOpacity={0.9}>
            <Text style={styles.secondaryButtonText}>全てONに戻す</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const statusBarPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 16 + statusBarPadding
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  headerContainer: {
    marginBottom: 16
  },
  helperText: {
    color: theme.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12
  },
  gridCard: {
    width: '48%', // Approx half with spacing
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    aspectRatio: 1.5,// Square cards
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative'
  },
  gridCardEnabled: {
    backgroundColor: theme.accentSoft, // Light orange bg
    borderColor: theme.accent,      // Orange border
  },
  gridCardDisabled: {
    backgroundColor: theme.card,
    borderColor: theme.divider,
    opacity: 0.6
  },
  targetIcon: {
    marginBottom: 10
  },
  gridTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  gridSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2
  },
  gridSubtitleEnabled: {
    color: palette.sunriseDark
  },
  gridSubtitleDisabled: {
    color: theme.textSecondary
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  secondaryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderColor: palette.sunrise,
    borderWidth: 1,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: palette.sunrise,
    fontWeight: '700',
    fontSize: 14
  }
});

export default PhotoTargetsScreen;
