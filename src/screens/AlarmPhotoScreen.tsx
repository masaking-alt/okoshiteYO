import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, ProgressBar, Text } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireMode, FireProps } from './fire/types';
import { getJapanesePhotoTargetLabel, pickRandomPhotoTargetLabel, PhotoTargetLabel } from '../data/photoTargets';
import { detectObject } from '../services/objectDetection';
import { palette } from '../theme/colors';

type Props = FireProps & {
  onFallback?: (mode: FireMode) => void;
  enabledTargets: PhotoTargetLabel[];
};

const MAX_ATTEMPTS = 3;
const FALLBACK_MODES: FireMode[] = ['math', 'shake'];

type DetectError = {
  code?: string;
  message?: string;
};

const describeDetectError = (error: unknown): DetectError => {
  if (error && typeof error === 'object') {
    const maybeError = error as { code?: string; message?: string };
    return { code: maybeError.code, message: maybeError.message };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return {};
};

const hintForErrorCode = (code?: string) => {
  switch (code) {
    case 'OBJECT_DETECT_IMAGE_ERROR':
      return '画像の読み込みに失敗しました';
    case 'OBJECT_DETECT_INFERENCE_ERROR':
      return 'モデル読み込み/推論に失敗しました';
    default:
      return undefined;
  }
};

const AlarmPhotoScreen: React.FC<Props> = ({ time, onGiveUp, onFallback, onBack, showBackButton, enabledTargets }) => {
  const { height: windowHeight } = useWindowDimensions();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [targetLabel, setTargetLabel] = useState<PhotoTargetLabel>(() => pickRandomPhotoTargetLabel(enabledTargets));
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string>('');
  const fallbackTriggered = useRef(false);

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);

  const triggerFallback = (message: string) => {
    if (!onFallback || fallbackTriggered.current) {
      return;
    }
    fallbackTriggered.current = true;
    setStatus(message);
    const fallback = FALLBACK_MODES[Math.floor(Math.random() * FALLBACK_MODES.length)];
    setTimeout(() => {
      onFallback(fallback);
    }, 400);
  };

  useEffect(() => {
    setTargetLabel(pickRandomPhotoTargetLabel(enabledTargets));
    setAttempts(0);
    setStatus('');
    fallbackTriggered.current = false;
  }, [enabledTargets, time]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      if (!photo?.uri) {
        setStatus('撮影に失敗しました');
        return;
      }
      const { matched } = await detectObject(photo.uri, targetLabel);
      if (matched) {
        setStatus('一致しました');
        onGiveUp();
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setStatus(`一致しませんでした。対象: ${getJapanesePhotoTargetLabel(targetLabel)}`);
      if (nextAttempts >= MAX_ATTEMPTS) {
        triggerFallback('一致しないため別の解除へ切替');
      }
    } catch (error) {
      const { code, message } = describeDetectError(error);
      const hint = hintForErrorCode(code);
      const debugMessage = [code, message, hint].filter(Boolean).join(' / ');
      console.warn('Failed to detect object', { error, targetLabel });
      setStatus(debugMessage ? `判定に失敗しました (${debugMessage})` : '判定に失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  const description = useMemo(() => {
    return `残り ${remainingAttempts} 回まで再撮影できます`;
  }, [remainingAttempts]);

  const buttonText = useMemo(() => {
    if (!permission?.granted) {
      return 'カメラを許可';
    }
    if (isCapturing) {
      return '撮影中';
    }
    return '撮影して解除';
  }, [isCapturing, permission?.granted]);

  const cameraMaxHeight = Math.min(windowHeight * 0.56, 620);
  const attemptProgress = attempts / MAX_ATTEMPTS;

  return (
    <AlarmFireLayout
      time={time}
      label="写真で解除"
      onGiveUp={onGiveUp}
      onBack={onBack}
      showBackButton={showBackButton}
      backgroundColor={palette.lavender}
      showGiveUpButton={false}
    >
      <Text variant="headlineSmall" style={styles.question}>
        {getJapanesePhotoTargetLabel(targetLabel)}を撮影
      </Text>
      <Text variant="bodyMedium" style={styles.targetLabel}>
        {description}
      </Text>
      <View style={[styles.cameraBox, { maxHeight: cameraMaxHeight }]}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text variant="bodyLarge" style={styles.cameraText}>
              カメラ許可が必要です
            </Text>
          </View>
        )}
      </View>
      <ProgressBar progress={attemptProgress} color="#fff" style={styles.progressBar} />
      {isCapturing && <ActivityIndicator color="#fff" style={styles.activity} />}
      <Button
        mode="contained-tonal"
        icon={permission?.granted ? 'camera-outline' : 'camera-plus-outline'}
        buttonColor="rgba(255,255,255,0.24)"
        textColor="#fff"
        style={styles.captureButton}
        disabled={isCapturing}
        onPress={permission?.granted ? handleCapture : () => requestPermission()}
      >
        {buttonText}
      </Button>
      {!!status && (
        <Text variant="bodySmall" style={styles.status}>
          {status}
        </Text>
      )}
    </AlarmFireLayout>
  );
};

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center'
  },
  cameraBox: {
    marginTop: 16,
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  cameraPreview: {
    width: '100%',
    height: '100%'
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18
  },
  cameraText: {
    color: '#fff',
    textAlign: 'center'
  },
  targetLabel: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center'
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 14
  },
  activity: {
    marginTop: 14
  },
  captureButton: {
    marginTop: 16
  },
  status: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center'
  }
});

export default AlarmPhotoScreen;
