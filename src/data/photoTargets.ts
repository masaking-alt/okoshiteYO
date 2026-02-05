export const PHOTO_TARGETS = [
  { en: 'scissors', ja: 'はさみ' },
  { en: 'keyboard', ja: 'キーボード' },
  { en: 'mouse', ja: 'マウス' },
  { en: 'bottle', ja: '瓶・ボトル' },
  { en: 'remote', ja: 'リモコン' },
  { en: 'book', ja: '本' },
  { en: 'cup', ja: 'カップ・コップ' },
  { en: 'laptop', ja: 'ノートパソコン' },
  { en: 'tv', ja: 'テレビ' },
  { en: 'chair', ja: '椅子' },
  { en: 'couch', ja: 'ソファ' },
  { en: 'dining table', ja: '食卓・ダイニングテーブル' },
  { en: 'potted plant', ja: '観葉植物（鉢植え）' },
  { en: 'clock', ja: '時計' },
  { en: 'vase', ja: '花瓶' },
  { en: 'bowl', ja: '鉢・ボウル・お椀' },
  { en: 'spoon', ja: 'スプーン' },
  { en: 'fork', ja: 'フォーク' }
] as const;

export type PhotoTargetLabel = (typeof PHOTO_TARGETS)[number]['en'];

export const getJapanesePhotoTargetLabel = (enLabel: PhotoTargetLabel): string => {
  const item = PHOTO_TARGETS.find((target) => target.en === enLabel);
  return item?.ja ?? enLabel;
};

export const isPhotoTargetLabel = (value: unknown): value is PhotoTargetLabel => {
  return PHOTO_TARGETS.some((target) => target.en === value);
};

export const getAllPhotoTargetLabels = (): PhotoTargetLabel[] => {
  return PHOTO_TARGETS.map((target) => target.en);
};

export const pickRandomPhotoTargetLabel = (enabled: readonly PhotoTargetLabel[]): PhotoTargetLabel => {
  const pool = enabled.length > 0 ? enabled : getAllPhotoTargetLabels();
  return pool[Math.floor(Math.random() * pool.length)];
};

