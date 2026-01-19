import { Alarm } from '../types';

export const alarmsMock: Alarm[] = [
  {
    id: '1',
    title: '一限講義 / 月水金',
    time: '06:45',
    repeatDays: ['月', '水', '金'],
    action: 'math',
    mode: 'fixed',
    active: true
  },
  {
    id: '2',
    title: 'バイト早番',
    time: '05:30',
    repeatDays: ['土'],
    action: 'photo',
    mode: 'random',
    active: true
  },
  {
    id: '3',
    title: '朝活ランニング',
    time: '07:15',
    repeatDays: ['日'],
    action: 'shake',
    mode: 'fixed',
    active: false
  }
];
