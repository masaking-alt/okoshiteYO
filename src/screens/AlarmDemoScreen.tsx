import React from 'react';
import AlarmFireRouter from './AlarmFireRouter';
import { FireMode } from './fire/types';

type Props = {
  mode: FireMode | 'random';
  onComplete: () => void;
};

const AlarmDemoScreen: React.FC<Props> = ({ mode, onComplete }) => {
  return <AlarmFireRouter mode={mode} onComplete={onComplete} />;
};

export default AlarmDemoScreen;
