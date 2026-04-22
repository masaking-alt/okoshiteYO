import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { Alarm, AlarmAction } from '../types';
import { normalizeAlarmVolume } from './alarmVolume';

type AlarmModuleType = {
  scheduleAlarm: (
    alarmId: string,
    timestamp: number,
    options?: { title?: string; mode?: string; time?: string; repeatDays?: string[]; volume?: number }
  ) => Promise<boolean>;
  cancelAlarm: (alarmId: string) => Promise<boolean>;
  stopAlarm: () => Promise<boolean>;
  finishAlarmActivity?: () => Promise<boolean>;
  getPendingAlarm?: () => Promise<AlarmFirePayload | null>;
  clearPendingAlarm?: () => Promise<boolean>;
  canScheduleExactAlarms?: () => Promise<boolean>;
  openExactAlarmSettings?: () => Promise<boolean>;
  openNotificationSettings?: () => Promise<boolean>;
  openDndSettings?: () => Promise<boolean>;
};

const alarmModule = NativeModules.AlarmModule as AlarmModuleType | undefined;
const isAndroid = Platform.OS === 'android';
const hasAlarmModule = isAndroid && !!alarmModule?.scheduleAlarm;

export type FireMode = AlarmAction | 'random';

export type AlarmScheduleInput = {
  id: string;
  title: string;
  time: string;
  repeatDays: string[];
  fireMode: FireMode;
  volume: number;
};

export type AlarmFirePayload = {
  alarm_id?: string;
  title?: string;
  mode?: string;
  time?: string;
  repeatDays?: string[];
  repeat_days?: string[];
  volume?: number;
};

const EN_DAY_TO_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};

const JP_DAY_TO_INDEX: Record<string, number> = {
  日: 0,
  月: 1,
  火: 2,
  水: 3,
  木: 4,
  金: 5,
  土: 6
};

const parseTime = (time: string) => {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
};

const normalizeRepeatDays = (repeatDays: string[]) => {
  const indices = new Set<number>();
  repeatDays.forEach((day) => {
    const trimmed = day.trim();
    if (!trimmed) {
      return;
    }
    if (trimmed in JP_DAY_TO_INDEX) {
      indices.add(JP_DAY_TO_INDEX[trimmed]);
      return;
    }
    const short = trimmed.slice(0, 3).toLowerCase();
    if (short in EN_DAY_TO_INDEX) {
      indices.add(EN_DAY_TO_INDEX[short]);
    }
  });
  return Array.from(indices).sort((a, b) => a - b);
};

export const coerceFireMode = (mode?: string): FireMode => {
  if (mode === 'random') {
    return 'random';
  }
  if (mode === 'math' || mode === 'shake' || mode === 'photo') {
    return mode;
  }
  return 'random';
};

export const buildScheduleInput = (alarm: Alarm): AlarmScheduleInput => ({
  id: alarm.id,
  title: alarm.title.trim() || 'アラーム',
  time: alarm.time,
  repeatDays: alarm.repeatDays,
  fireMode: alarm.mode === 'random' ? 'random' : alarm.action,
  volume: normalizeAlarmVolume(alarm.volume)
});

export const buildScheduleInputFromPayload = (payload: AlarmFirePayload): AlarmScheduleInput | null => {
  if (!payload.alarm_id || !payload.time) {
    return null;
  }
  const repeatDays = payload.repeatDays ?? payload.repeat_days ?? [];
  return {
    id: payload.alarm_id,
    title: (payload.title ?? '').trim() || 'アラーム',
    time: payload.time,
    repeatDays,
    fireMode: coerceFireMode(payload.mode),
    volume: normalizeAlarmVolume(payload.volume)
  };
};

export const getNextTriggerAt = (time: string, repeatDays: string[], now = new Date()): Date | null => {
  const parsed = parseTime(time);
  if (!parsed) {
    return null;
  }
  const repeatIndices = normalizeRepeatDays(repeatDays);
  const base = new Date(now.getTime());
  base.setSeconds(0, 0);

  if (repeatIndices.length === 0) {
    const candidate = new Date(base.getTime());
    candidate.setHours(parsed.hour, parsed.minute, 0, 0);
    if (candidate.getTime() <= base.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate;
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(base.getTime());
    candidate.setDate(base.getDate() + offset);
    candidate.setHours(parsed.hour, parsed.minute, 0, 0);
    if (!repeatIndices.includes(candidate.getDay())) {
      continue;
    }
    if (offset === 0 && candidate.getTime() <= base.getTime()) {
      continue;
    }
    return candidate;
  }

  return null;
};

export const scheduleAlarm = async (input: AlarmScheduleInput): Promise<number | null> => {
  if (!hasAlarmModule) {
    return null;
  }
  const triggerAt = getNextTriggerAt(input.time, input.repeatDays);
  if (!triggerAt) {
    return null;
  }
  const options: { title?: string; mode?: string; time?: string; repeatDays?: string[]; volume?: number } = {
    title: input.title,
    mode: input.fireMode,
    time: input.time,
    volume: normalizeAlarmVolume(input.volume)
  };
  if (input.repeatDays.length > 0) {
    options.repeatDays = input.repeatDays;
  }
  await alarmModule.scheduleAlarm(input.id, triggerAt.getTime(), options);
  return triggerAt.getTime();
};

export const cancelAlarm = async (alarmId: string): Promise<boolean> => {
  if (!hasAlarmModule || !alarmModule?.cancelAlarm) {
    return false;
  }
  await alarmModule.cancelAlarm(alarmId);
  return true;
};

export const stopAlarm = async (): Promise<boolean> => {
  if (!hasAlarmModule || !alarmModule?.stopAlarm) {
    return false;
  }
  await alarmModule.stopAlarm();
  return true;
};

export const finishAlarmActivity = async (): Promise<boolean> => {
  if (!hasAlarmModule || !alarmModule?.finishAlarmActivity) {
    return false;
  }
  return alarmModule.finishAlarmActivity();
};

export const getPendingAlarm = async (): Promise<AlarmFirePayload | null> => {
  if (!hasAlarmModule || !alarmModule?.getPendingAlarm) {
    return null;
  }
  return alarmModule.getPendingAlarm();
};

export const clearPendingAlarm = async (): Promise<boolean> => {
  if (!hasAlarmModule || !alarmModule?.clearPendingAlarm) {
    return false;
  }
  return alarmModule.clearPendingAlarm();
};

export const canScheduleExactAlarms = async (): Promise<boolean> => {
  if (!hasAlarmModule || !alarmModule?.canScheduleExactAlarms) {
    return true;
  }
  return alarmModule.canScheduleExactAlarms();
};

export const openExactAlarmSettings = async (): Promise<void> => {
  if (!hasAlarmModule || !alarmModule?.openExactAlarmSettings) {
    return;
  }
  await alarmModule.openExactAlarmSettings();
};

export const openNotificationSettings = async (): Promise<void> => {
  if (!hasAlarmModule || !alarmModule?.openNotificationSettings) {
    return;
  }
  await alarmModule.openNotificationSettings();
};

export const openDndSettings = async (): Promise<void> => {
  if (!hasAlarmModule || !alarmModule?.openDndSettings) {
    return;
  }
  await alarmModule.openDndSettings();
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (!isAndroid) {
    return true;
  }
  if (Number(Platform.Version) < 33) {
    return true;
  }
  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    return true;
  }
  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};
