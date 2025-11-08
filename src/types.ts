export type AlarmAction = 'math' | 'shake' | 'photo';

export interface Alarm {
  id: string;
  title: string;
  time: string;
  nextTriggerLabel: string;
  repeatDays: string[];
  action: AlarmAction;
  actionDetail: string;
  toneLabel: string;
  active: boolean;
}
