export type AlarmAction = 'math' | 'shake' | 'photo';

export interface Alarm {
  id: string;
  title: string;
  time: string;
  repeatDays: string[];
  action: AlarmAction;
  mode: 'fixed' | 'random';
  active: boolean;
  note?: string;
}

