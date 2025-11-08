import { Alarm } from '../types';

export const alarmsMock: Alarm[] = [
  {
    id: '1',
    title: '一限講義 / 月水金',
    time: '06:45',
    nextTriggerLabel: '次回: 月 6:45 AM',
    repeatDays: ['Mon', 'Wed', 'Fri'],
    action: 'math',
    actionDetail: '計算 3問 (中級)',
    toneLabel: 'エナジーブラック',
    active: true
  },
  {
    id: '2',
    title: 'バイト早番',
    time: '05:30',
    nextTriggerLabel: '次回: 土 5:30 AM',
    repeatDays: ['Sat'],
    action: 'photo',
    actionDetail: '玄関マットを撮影',
    toneLabel: '防音モード + バイブ',
    active: true
  },
  {
    id: '3',
    title: '朝活ランニング',
    time: '07:15',
    nextTriggerLabel: '次回: 日 7:15 AM',
    repeatDays: ['Sun'],
    action: 'shake',
    actionDetail: '50回シェイク',
    toneLabel: 'やる気ビート',
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
