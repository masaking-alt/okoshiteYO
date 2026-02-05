import React from 'react';
import AlarmFireRouter from './AlarmFireRouter';
import { FireMode } from './fire/types';
import { PhotoTargetLabel } from '../data/photoTargets';

type Props = {
  mode: FireMode | 'random';
  onComplete: () => void;
  time?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  enabledPhotoTargets: PhotoTargetLabel[];
};

const AlarmDemoScreen: React.FC<Props> = ({ mode, onComplete, time, onBack, showBackButton, enabledPhotoTargets }) => {
  return (
    <AlarmFireRouter
      mode={mode}
      onComplete={onComplete}
      time={time}
      onBack={onBack}
      showBackButton={showBackButton}
      enabledPhotoTargets={enabledPhotoTargets}
    />
  );
};

export default AlarmDemoScreen;
