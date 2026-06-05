import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput as PaperTextInput } from 'react-native-paper';
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

const AlarmMathScreen: React.FC<FireProps> = ({ time, onGiveUp, onBack, showBackButton }) => {
  const [questions] = useState<Question[]>(() => [createQuestion(), createQuestion(), createQuestion()]);
  const [index, setIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [inputValue, setInputValue] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locked, setLocked] = useState<boolean>(false);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = questions[index];

  const statusText = useMemo(() => {
    switch (status) {
      case 'correct':
        return '正解。解除中です。';
      case 'wrong':
        return '違います。少し待って再入力してください。';
      default:
        return '正解を入力して解除';
    }
  }, [status]);

  const handleAnswer = (value: number) => {
    if (status === 'correct') {
      return;
    }
    if (value === current.answer) {
      setStatus('correct');
      timerRef.current = setTimeout(() => {
        if (index === questions.length - 1) {
          onGiveUp();
        } else {
          setIndex((i) => i + 1);
          setStatus('idle');
          setInputValue('');
        }
      }, 400);
      return;
    }

    setStatus('wrong');
    setLocked(true);
    if (wrongTimerRef.current) {
      clearTimeout(wrongTimerRef.current);
    }
    wrongTimerRef.current = setTimeout(() => {
      setStatus('idle');
      setLocked(false);
      setInputValue('');
    }, 3000);
  };

  const handleSubmit = () => {
    if (locked || status === 'correct') {
      return;
    }
    const parsed = Number.parseInt(inputValue, 10);
    if (Number.isNaN(parsed)) {
      setStatus('wrong');
      return;
    }
    handleAnswer(parsed);
    Keyboard.dismiss();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (wrongTimerRef.current) {
        clearTimeout(wrongTimerRef.current);
      }
    };
  }, []);

  return (
    <AlarmFireLayout time={time} label="計算を解かないと止まらない" onGiveUp={onGiveUp} onBack={onBack} showBackButton={showBackButton}>
      <Text variant="labelLarge" style={styles.progress}>
        問題 {index + 1} / {questions.length}
      </Text>
      <Text variant="headlineMedium" style={styles.question}>
        {current.left} + {current.right} = ?
      </Text>
      <Text variant="bodyMedium" style={styles.status}>
        {statusText}
      </Text>
      <View style={styles.answerRow}>
        <PaperTextInput
          mode="outlined"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="答え"
          keyboardType="number-pad"
          returnKeyType="done"
          editable={!locked && status !== 'correct'}
          onSubmitEditing={handleSubmit}
          style={styles.input}
          textColor="#fff"
          placeholderTextColor="rgba(255,255,255,0.7)"
          outlineColor="rgba(255,255,255,0.55)"
          activeOutlineColor="#fff"
        />
        <Button
          mode="contained-tonal"
          disabled={locked || status === 'correct'}
          buttonColor="rgba(255,255,255,0.24)"
          textColor="#fff"
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          確認
        </Button>
      </View>
    </AlarmFireLayout>
  );
};

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center'
  },
  status: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center'
  },
  answerRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    gap: 10
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  submitButton: {
    alignSelf: 'center'
  },
  progress: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  }
});

export default AlarmMathScreen;
