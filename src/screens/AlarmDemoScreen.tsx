import React from 'react';
import AlarmFireRouter from './AlarmFireRouter';
import { FireMode } from './fire/types';

type Props = {
  mode: FireMode | 'random';
  onComplete: () => void;
  time?: string;
};

const AlarmDemoScreen: React.FC<Props> = ({ mode, onComplete, time }) => {
  return <AlarmFireRouter mode={mode} onComplete={onComplete} time={time} />;
};

export default AlarmDemoScreen;
