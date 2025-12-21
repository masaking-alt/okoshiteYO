import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

const AlarmMathScreen: React.FC<FireProps> = ({ time, onGiveUp }) => {
  return (
    <AlarmFireLayout time={time} label="計算を解かないと止まらない" onGiveUp={onGiveUp}>
      <Text style={styles.question}>12 + 37 = ?</Text>
      <View style={styles.answerRow}>
        {['49', '59', '51'].map((ans) => (
          <View key={ans} style={styles.answerBox}>
            <Text style={styles.answerText}>{ans}</Text>
          </View>
        ))}
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
  answerRow: {
    flexDirection: 'row',
    marginTop: 20
  },
  answerBox: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    alignItems: 'center'
  },
  answerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  }
});

export default AlarmMathScreen;
