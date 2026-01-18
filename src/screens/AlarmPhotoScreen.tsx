import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireMode, FireProps } from './fire/types';
import { computePhotoHash, hammingDistance } from '../services/photoHash';
import { getPhotoReferenceHash, setPhotoReference } from '../services/photoReferenceStore';

type PhotoMode = 'verify' | 'register';

type Props = FireProps & {
  mode?: PhotoMode;
  onRegisterComplete?: () => void;
  onFallback?: (mode: FireMode) => void;
};

const HASH_THRESHOLD = 25;
const MAX_ATTEMPTS = 3;
const FALLBACK_MODES: FireMode[] = ['math', 'shake'];

const AlarmPhotoScreen: React.FC<Props> = ({ time, onGiveUp, mode = 'verify', onRegisterComplete, onFallback }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [referenceHash, setReferenceHash] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<string>('');
  const fallbackTriggered = useRef(false);

  const isRegister = mode === 'register';
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
    let active = true;
    if (isRegister) {
      setReferenceHash(null);
      setAttempts(0);
      setStatus('');
      fallbackTriggered.current = false;
      return () => {
        active = false;
      };
    }
    const loadReference = async () => {
      try {
        const stored = await getPhotoReferenceHash();
        if (!active) {
          return;
        }
        setReferenceHash(stored);
        if (!stored) {
          triggerFallback('参照写真が未登録のため別の解除へ切替');
        }
      } catch {
        if (active) {
          setReferenceHash(null);
          triggerFallback('参照写真の読み込みに失敗しました');
        }
      }
    };
    loadReference();
    return () => {
      active = false;
    };
  }, [isRegister, onFallback]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      const { hash, normalizedUri } = await computePhotoHash(photo.uri);
      if (isRegister) {
        await setPhotoReference(hash, normalizedUri);
        setStatus('参照写真を登録しました');
        setTimeout(() => {
          onRegisterComplete?.();
        }, 400);
        return;
      }
      if (!referenceHash) {
        triggerFallback('参照写真が未登録のため別の解除へ切替');
        return;
      }
      const distance = hammingDistance(hash, referenceHash);
      if (distance <= HASH_THRESHOLD) {
        setStatus('一致しました');
        onGiveUp();
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setStatus(`一致しませんでした (差分 ${distance})`);
      if (nextAttempts >= MAX_ATTEMPTS) {
        triggerFallback('一致しないため別の解除へ切替');
      }
    } catch (error) {
      if ((error as { code?: string })?.code === 'PHOTO_TOO_DARK') {
        setStatus('暗すぎるため撮り直してください');
        return;
      }
      console.warn('Failed to take photo', error);
      setStatus('撮影に失敗しました');
    } finally {
      setIsCapturing(false);
    }
  };

  const label = isRegister ? '参照写真を登録' : '証拠写真で解除';
  const description = useMemo(() => {
    if (isRegister) {
      return 'この写真を解除の基準として登録します';
    }
    if (referenceHash) {
      return `残り ${remainingAttempts} 回まで再撮影できます`;
    }
    return '参照写真が未登録です';
  }, [isRegister, referenceHash, remainingAttempts]);

  const buttonText = useMemo(() => {
    if (!permission?.granted) {
      return 'カメラを許可';
    }
    if (isCapturing) {
      return '撮影中...';
    }
    return isRegister ? '撮影して登録' : '撮影して解除';
  }, [isCapturing, isRegister, permission?.granted]);

  return (
    <AlarmFireLayout time={time} label={label} onGiveUp={onGiveUp} backgroundColor="#FF70A6">
      <Text style={styles.question}>撮影してください</Text>
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
    height: 160,
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
