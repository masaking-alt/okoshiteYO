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

export const actionMeta = {
  math: {
    title: '計算チャレンジ',
    description: '頭をフル稼働させる3〜5問の計算問題。難易度は3段階。',
    badge: 'BRAIN BOOST'
  },
  shake: {
    title: 'シェイク解除',
    description: '端末を一定回数振って血流をアップ。',
    badge: 'MOVE'
  },
  photo: {
    title: '証拠ショット',
    description: '登録済みの場所を撮影しないと止まらない。',
    badge: 'PROOF'
  }
} as const;
