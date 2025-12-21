import React from 'react';
import AlarmMathScreen from './AlarmMathScreen';
import AlarmShakeScreen from './AlarmShakeScreen';
import AlarmPhotoScreen from './AlarmPhotoScreen';
import { FireMode } from './fire/types';

type Props = {
  mode: FireMode | 'random';
  onComplete: () => void;
  time?: string;
};

const AlarmFireRouter: React.FC<Props> = ({ mode, onComplete, time = '05:30' }) => {
  const resolvedMode = mode === 'random' ? pickRandomMode() : mode;

  if (resolvedMode === 'shake') {
    return <AlarmShakeScreen time={time} onGiveUp={onComplete} />;
  }
  if (resolvedMode === 'photo') {
    return <AlarmPhotoScreen time={time} onGiveUp={onComplete} />;
  }
  return <AlarmMathScreen time={time} onGiveUp={onComplete} />;
};

const pickRandomMode = (): FireMode => {
  const modes: FireMode[] = ['math', 'shake', 'photo'];
  return modes[Math.floor(Math.random() * modes.length)];
};

export default AlarmFireRouter;
