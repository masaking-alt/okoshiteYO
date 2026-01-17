import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

const AlarmPhotoScreen: React.FC<FireProps> = ({ time, onGiveUp }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      await cameraRef.current.takePictureAsync({ quality: 0.6 });
      onGiveUp();
    } catch (error) {
      console.warn('Failed to take photo', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <AlarmFireLayout time={time} label="証拠写真で解除" onGiveUp={onGiveUp} backgroundColor="#FF70A6">
      <Text style={styles.question}>登録した場所を撮影してください</Text>
      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraText}>[ カメラプレビュー ]</Text>
          </View>
        )}
      </View>
      {permission?.granted ? (
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture} activeOpacity={0.9}>
          <Text style={styles.captureText}>{isCapturing ? '撮影中...' : '撮影して解除'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.captureButton} onPress={() => requestPermission()} activeOpacity={0.9}>
          <Text style={styles.captureText}>カメラを許可</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.hint}>撮影が成功したら解除されます。</Text>
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
  }
});

export default AlarmPhotoScreen;
