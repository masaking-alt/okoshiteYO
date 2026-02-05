import React, { useEffect, useState } from 'react';
import AlarmMathScreen from './AlarmMathScreen';
import AlarmShakeScreen from './AlarmShakeScreen';
import AlarmPhotoScreen from './AlarmPhotoScreen';
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

const AlarmFireRouter: React.FC<Props> = ({
  mode,
  onComplete,
  time = '05:30',
  onBack,
  showBackButton,
  enabledPhotoTargets
}) => {
  const [overrideMode, setOverrideMode] = useState<FireMode | null>(null);

  useEffect(() => {
    setOverrideMode(null);
  }, [mode, time]);

  const resolvedMode = overrideMode ?? (mode === 'random' ? pickRandomMode() : mode);

  if (resolvedMode === 'shake') {
    return <AlarmShakeScreen time={time} onGiveUp={onComplete} onBack={onBack} showBackButton={showBackButton} />;
  }
  if (resolvedMode === 'photo') {
    return (
      <AlarmPhotoScreen
        time={time}
        onGiveUp={onComplete}
        onFallback={setOverrideMode}
        onBack={onBack}
        showBackButton={showBackButton}
        enabledTargets={enabledPhotoTargets}
      />
    );
  }
  return <AlarmMathScreen time={time} onGiveUp={onComplete} onBack={onBack} showBackButton={showBackButton} />;
};

const pickRandomMode = (): FireMode => {
  const modes: FireMode[] = ['math', 'shake', 'photo'];
  return modes[Math.floor(Math.random() * modes.length)];
};

export default AlarmFireRouter;
