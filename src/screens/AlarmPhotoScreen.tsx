import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

const AlarmPhotoScreen: React.FC<FireProps> = ({ time, onGiveUp }) => {
  return (
    <AlarmFireLayout time={time} label="証拠写真で解除" onGiveUp={onGiveUp} backgroundColor="#FF70A6">
      <Text style={styles.question}>登録した場所を撮影してください</Text>
      <View style={styles.cameraBox}>
        <Text style={styles.cameraText}>[ カメラプレビュー ]</Text>
      </View>
      <Text style={styles.hint}>撮影後に判定します。権限とネイティブ連携は後で実装。</Text>
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
    justifyContent: 'center'
  },
  cameraText: {
    color: '#fff',
    fontSize: 18
  },
  hint: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center'
  }
});

export default AlarmPhotoScreen;
