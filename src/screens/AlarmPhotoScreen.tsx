import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ActionFeedback, {
  ActionFeedbackTone,
  SUCCESS_FEEDBACK_DURATION_MS
} from '../components/ActionFeedback';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireMode, FireProps } from './fire/types';
import { getJapanesePhotoTargetLabel, pickRandomPhotoTargetLabel, PhotoTargetLabel } from '../data/photoTargets';
import { detectObject } from '../services/objectDetection';

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

type PhotoFeedback = {
  message: string;
  tone: ActionFeedbackTone;
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

const AlarmPhotoScreen: React.FC<Props> = ({
  time,
  onGiveUp,
  onFallback,
  onBack,
  showBackButton,
  enabledTargets
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [targetLabel, setTargetLabel] = useState<PhotoTargetLabel>(() => pickRandomPhotoTargetLabel(enabledTargets));
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<PhotoFeedback>({
    message: '対象物が写るように撮影してください。',
    tone: 'info'
  });
  const fallbackTriggered = useRef(false);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);

  const triggerFallback = (message: string) => {
    if (!onFallback || fallbackTriggered.current) {
      return;
    }
    fallbackTriggered.current = true;
    setFeedback({ message, tone: 'error' });
    const fallback = FALLBACK_MODES[Math.floor(Math.random() * FALLBACK_MODES.length)];
    actionTimerRef.current = setTimeout(() => {
      onFallback(fallback);
    }, SUCCESS_FEEDBACK_DURATION_MS);
  };

  useEffect(() => {
    setTargetLabel(pickRandomPhotoTargetLabel(enabledTargets));
    setAttempts(0);
    setFeedback({
      message: '対象物が写るように撮影してください。',
      tone: 'info'
    });
    fallbackTriggered.current = false;
    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
    };
  }, [enabledTargets, time]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      const { matched } = await detectObject(photo.uri, targetLabel);
      if (matched) {
        setFeedback({ message: '成功しました。アラームを解除します。', tone: 'success' });
        actionTimerRef.current = setTimeout(() => {
          onGiveUp();
        }, SUCCESS_FEEDBACK_DURATION_MS);
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= MAX_ATTEMPTS) {
        triggerFallback('一致しませんでした。別の解除方法へ切り替えます。');
      } else {
        setFeedback({
          message: `一致しませんでした。残り ${MAX_ATTEMPTS - nextAttempts} 回撮影できます。`,
          tone: 'error'
        });
      }
    } catch (error) {
      const { code, message } = describeDetectError(error);
      const hint = hintForErrorCode(code);
      const debugMessage = [code, message, hint].filter(Boolean).join(' / ');
      console.warn('Failed to detect object', { error, targetLabel });
      setFeedback({
        message: debugMessage ? `判定に失敗しました。${debugMessage}` : '判定に失敗しました。もう一度撮影してください。',
        tone: 'error'
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const label = '写真で解除';
  const description = useMemo(() => {
    return `対象: ${getJapanesePhotoTargetLabel(targetLabel)} / 残り ${remainingAttempts} 回まで再撮影できます`;
  }, [targetLabel, remainingAttempts]);

  const buttonText = useMemo(() => {
    if (!permission?.granted) {
      return 'カメラを許可';
    }
    if (isCapturing) {
      return '撮影中...';
    }
    return '撮影して解除';
  }, [isCapturing, permission?.granted]);

  const shutterDisabled = isCapturing;
  const cameraMaxHeight = Math.min(windowHeight * 0.56, 620);

  return (
    <AlarmFireLayout
      time={time}
      label={label}
      onGiveUp={onGiveUp}
      onBack={onBack}
      showBackButton={showBackButton}
      backgroundColor="#FF70A6"
      showGiveUpButton={false}
    >
      <Text style={styles.question}>撮影してください</Text>
      <Text style={styles.targetLabel}>対象: {getJapanesePhotoTargetLabel(targetLabel)}</Text>
      <View style={[styles.cameraBox, { maxHeight: cameraMaxHeight }]}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraText}>[ カメラプレビュー ]</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.shutterButton, shutterDisabled && styles.shutterButtonDisabled]}
        onPress={permission?.granted ? handleCapture : () => requestPermission()}
        activeOpacity={0.9}
        disabled={shutterDisabled}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <View style={[styles.shutterOuter, !permission?.granted && styles.shutterOuterPending]}>
          <View style={[styles.shutterInner, !permission?.granted && styles.shutterInnerPending]} />
        </View>
      </TouchableOpacity>
      <Text style={styles.captureLabel}>{buttonText}</Text>
      <Text style={styles.hint}>{description}</Text>
      <ActionFeedback message={feedback.message} tone={feedback.tone} />
    </AlarmFireLayout>
  );
};

const SHUTTER_OUTER_SIZE = 78;
const SHUTTER_INNER_SIZE = 62;

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  cameraBox: {
    marginTop: 14,
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
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
    justifyContent: 'center'
  },
  cameraText: {
    color: '#fff',
    fontSize: 18
  },
  shutterButton: {
    marginTop: 16,
    width: SHUTTER_OUTER_SIZE,
    height: SHUTTER_OUTER_SIZE,
    borderRadius: SHUTTER_OUTER_SIZE / 2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shutterButtonDisabled: {
    opacity: 0.6
  },
  shutterOuter: {
    width: SHUTTER_OUTER_SIZE,
    height: SHUTTER_OUTER_SIZE,
    borderRadius: SHUTTER_OUTER_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  shutterOuterPending: {
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  shutterInner: {
    width: SHUTTER_INNER_SIZE,
    height: SHUTTER_INNER_SIZE,
    borderRadius: SHUTTER_INNER_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.95)'
  },
  shutterInnerPending: {
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  captureLabel: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 10,
    alignSelf: 'center',
    textAlign: 'center'
  },
  targetLabel: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700'
  },
  hint: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center'
  }
});

export default AlarmPhotoScreen;
