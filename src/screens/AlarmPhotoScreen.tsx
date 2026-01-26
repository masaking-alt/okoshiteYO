import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireMode, FireProps } from './fire/types';
import { detectObject } from '../services/objectDetection';

type Props = FireProps & {
  onFallback?: (mode: FireMode) => void;
};

const MAX_ATTEMPTS = 3;
const FALLBACK_MODES: FireMode[] = ['math', 'shake'];
const TARGET_LABELS = [
  { en: 'scissors', ja: 'はさみ' },
  { en: 'keyboard', ja: 'キーボード' },
  { en: 'mouse', ja: 'マウス' },
  { en: 'bottle', ja: '瓶・ボトル' },
  { en: 'remote', ja: 'リモコン' },
  { en: 'book', ja: '本' },
  { en: 'cup', ja: 'カップ・コップ' },
  { en: 'laptop', ja: 'ノートパソコン' },
  { en: 'tv', ja: 'テレビ' },
  { en: 'chair', ja: '椅子' },
  { en: 'couch', ja: 'ソファ' },
  { en: 'dining table', ja: '食卓・ダイニングテーブル' },
  { en: 'potted plant', ja: '観葉植物（鉢植え）' },
  { en: 'clock', ja: '時計' },
  { en: 'vase', ja: '花瓶' },
  { en: 'bowl', ja: '鉢・ボウル・お椀' },
  { en: 'spoon', ja: 'スプーン' },
  { en: 'fork', ja: 'フォーク' },
] as const;
type TargetLabel = (typeof TARGET_LABELS)[number]['en'];

type DetectError = {
  code?: string;
  message?: string;
};

const pickTargetLabel = (): TargetLabel => {
  return TARGET_LABELS[Math.floor(Math.random() * TARGET_LABELS.length)].en;
};

const getJapaneseLabel = (enLabel: TargetLabel): string => {
  const item = TARGET_LABELS.find(t => t.en === enLabel);
  return item?.ja || enLabel;
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

const AlarmPhotoScreen: React.FC<Props> = ({ time, onGiveUp, onFallback }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [targetLabel, setTargetLabel] = useState<TargetLabel>(() => pickTargetLabel());
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
    setTargetLabel(pickTargetLabel());
    setAttempts(0);
    setStatus('');
    fallbackTriggered.current = false;
  }, [time]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      const { matched } = await detectObject(photo.uri, targetLabel);
      if (matched) {
        setStatus('一致しました');
        onGiveUp();
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setStatus(`一致しませんでした (対象: ${getJapaneseLabel(targetLabel)})`);
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

  const label = '写真で解除';
  const description = useMemo(() => {
    return `対象: ${getJapaneseLabel(targetLabel)} / 残り ${remainingAttempts} 回まで再撮影できます`;
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

  return (
    <AlarmFireLayout time={time} label={label} onGiveUp={onGiveUp} backgroundColor="#FF70A6" showGiveUpButton={false}>
      <Text style={styles.question}>撮影してください</Text>
      <Text style={styles.targetLabel}>対象: {getJapaneseLabel(targetLabel)}</Text>
      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraText}>[ カメラプレビュー ]</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.captureButton}
        onPress={permission?.granted ? handleCapture : () => requestPermission()}
        activeOpacity={0.9}
      >
        <Text style={styles.captureText}>{buttonText}</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>{description}</Text>
      {!!status && <Text style={styles.status}>{status}</Text>}
    </AlarmFireLayout>
  );
};

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  cameraBox: {
    marginTop: 24,
    height: 500,
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
  captureButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  captureText: {
    color: '#FF70A6',
    fontWeight: '700'
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
  },
  status: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12
  }
});

export default AlarmPhotoScreen;
