import { Alarm } from '../types';

export const alarmsMock: Alarm[] = [
  {
    id: '1',
    title: '一限講義 / 月水金',
    time: '06:45',
    repeatDays: ['Mon', 'Wed', 'Fri'],
    action: 'math',
    mode: 'fixed',
    active: true
  },
  {
    id: '2',
    title: 'バイト早番',
    time: '05:30',
    repeatDays: ['Sat'],
    action: 'photo',
    mode: 'random',
    active: true
  },
  {
    id: '3',
    title: '朝活ランニング',
    time: '07:15',
    repeatDays: ['Sun'],
    action: 'shake',
    mode: 'fixed',
    active: false
  }
];
