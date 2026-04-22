export const MIN_ALARM_VOLUME = 0.2;
export const MAX_ALARM_VOLUME = 1;
export const DEFAULT_ALARM_VOLUME = 0.8;
export const ALARM_VOLUME_STEP = 0.1;

export const normalizeAlarmVolume = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_ALARM_VOLUME;
  }
  const clamped = Math.min(MAX_ALARM_VOLUME, Math.max(MIN_ALARM_VOLUME, numeric));
  return Math.round(clamped * 100) / 100;
};

export const formatAlarmVolume = (value: number): string => {
  return `${Math.round(normalizeAlarmVolume(value) * 100)}%`;
};
