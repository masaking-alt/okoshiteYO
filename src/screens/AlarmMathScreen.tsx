import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

type Question = {
  left: number;
  right: number;
  answer: number;
  options: number[];
};

const createQuestion = (): Question => {
  const left = 10 + Math.floor(Math.random() * 90);
  const right = 10 + Math.floor(Math.random() * 90);
  const answer = left + right;
  const options = new Set<number>([answer]);
  while (options.size < 3) {
    const delta = Math.floor(Math.random() * 9) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    options.add(answer + delta * sign);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  return { left, right, answer, options: shuffled };
};

const AlarmMathScreen: React.FC<FireProps> = ({ time, onGiveUp }) => {
  const [question] = useState<Question>(() => createQuestion());
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusText = useMemo(() => {
    switch (status) {
      case 'correct':
        return '正解！解除中...';
      case 'wrong':
        return '違います。もう一度。';
      default:
        return '正解を選んで解除';
    }
  }, [status]);

  const handleAnswer = (value: number) => {
    if (status === 'correct') {
      return;
    }
    if (value === question.answer) {
      setStatus('correct');
      timerRef.current = setTimeout(() => {
        onGiveUp();
      }, 400);
      return;
    }
    setStatus('wrong');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AlarmFireLayout time={time} label="計算を解かないと止まらない" onGiveUp={onGiveUp}>
      <Text style={styles.question}>
        {question.left} + {question.right} = ?
      </Text>
      <Text style={styles.status}>{statusText}</Text>
      <View style={styles.answerRow}>
        {question.options.map((ans) => (
          <TouchableOpacity key={ans} style={styles.answerBox} onPress={() => handleAnswer(ans)} activeOpacity={0.85}>
            <Text style={styles.answerText}>{ans}</Text>
          </TouchableOpacity>
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
  status: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
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
