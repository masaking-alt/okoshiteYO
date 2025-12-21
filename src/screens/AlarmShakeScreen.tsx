import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

const AlarmShakeScreen: React.FC<FireProps> = ({ time, onGiveUp }) => {
  return (
    <AlarmFireLayout time={time} label="端末を振って解除" onGiveUp={onGiveUp} backgroundColor="#FFD166">
      <Text style={styles.question}>残り 37 シェイク！</Text>
      <View style={styles.progressOuter}>
        <View style={styles.progressFill} />
      </View>
    </AlarmFireLayout>
  );
};

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center'
  },
  progressOuter: {
    width: '100%',
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 20
  },
  progressFill: {
    width: '38%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#fff'
  }
});

export default AlarmShakeScreen;
