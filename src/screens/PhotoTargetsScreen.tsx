import React from 'react';
import { Alert, FlatList, PixelRatio, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Armchair,
  BookOpen,
  BottleWine,
  Clock,
  Coffee,
  Flower2,
  Keyboard,
  Laptop,
  Mouse,
  RadioReceiver,
  Scissors,
  Sofa,
  Soup,
  Sprout,
  Table2,
  Tv,
  Utensils,
  UtensilsCrossed,
  type LucideIcon
} from 'lucide-react-native';
import { getAllPhotoTargetLabels, getJapanesePhotoTargetLabel, PHOTO_TARGETS, PhotoTargetLabel } from '../data/photoTargets';
import { palette, theme } from '../theme/colors';

const MIN_ENABLED_PHOTO_TARGETS = 3;
const TARGET_ICON_SIZE = PixelRatio.roundToNearestPixel(44);

const TARGET_ICONS: Record<PhotoTargetLabel, LucideIcon> = {
  scissors: Scissors,
  keyboard: Keyboard,
  mouse: Mouse,
  bottle: BottleWine,
  // リモコン単体のアイコンがないため、形状が近い受信機を使う
  remote: RadioReceiver,
  book: BookOpen,
  cup: Coffee,
  laptop: Laptop,
  tv: Tv,
  chair: Armchair,
  couch: Sofa,
  'dining table': Table2,
  'potted plant': Sprout,
  clock: Clock,
  // 花瓶単体のアイコンがないため、用途が近い花のアイコンを使う
  vase: Flower2,
  bowl: Soup,
  // スプーン単体のアイコンがないため、食器のアイコンを使う
  spoon: Utensils,
  // フォーク単体のアイコンがないため、食器のアイコンを使う
  fork: UtensilsCrossed
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
    const TargetIcon = TARGET_ICONS[item.en];
    const iconColor = enabled ? palette.sunriseDark : theme.textSecondary;

    return (
      <TouchableOpacity
        style={[
          styles.gridCard,
          enabled ? styles.gridCardEnabled : styles.gridCardDisabled
        ]}
        onPress={() => toggle(item.en)}
        activeOpacity={0.8}
      >
        <View style={styles.targetIconFrame}>
          <TargetIcon
            size={TARGET_ICON_SIZE}
            color={iconColor}
            strokeWidth={2.2}
            absoluteStrokeWidth
          />
        </View>
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
    width: '48%',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    aspectRatio: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative'
  },
  gridCardEnabled: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
  },
  gridCardDisabled: {
    backgroundColor: theme.card,
    borderColor: theme.divider,
    opacity: 0.6
  },
  targetIconFrame: {
    width: TARGET_ICON_SIZE,
    height: TARGET_ICON_SIZE,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
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
