import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
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
  const [questions] = useState<Question[]>(() => [createQuestion(), createQuestion(), createQuestion()]);
  const [index, setIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<TextInput | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locked, setLocked] = useState<boolean>(false);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = questions[index];

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
    if (value === current.answer) {
      setStatus('correct');
      timerRef.current = setTimeout(() => {
        if (index === questions.length - 1) {
          onGiveUp();
        } else {
          setIndex((i) => i + 1);
          setStatus('idle');
          setInputValue('');
          // focus next input
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }, 400);
      return;
    }
    // wrong: disable input for ~3s
    setStatus('wrong');
    setLocked(true);
    if (wrongTimerRef.current) {
      clearTimeout(wrongTimerRef.current);
    }
    wrongTimerRef.current = setTimeout(() => {
      setStatus('idle');
      setLocked(false);
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 3000);
  };

  const handleSubmit = () => {
    if (locked || status === 'correct') return;
    const parsed = parseInt(inputValue, 10);
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
    <AlarmFireLayout time={time} label="計算を解かないと止まらない" onGiveUp={onGiveUp}>
      <Text style={styles.progress}>問題 {index + 1} / {questions.length}</Text>
      <Text style={styles.question}>
        {current.left} + {current.right} = ?
      </Text>
      <Text style={styles.status}>{statusText}</Text>
      <View style={styles.answerRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputValue}
          onChangeText={(t) => setInputValue(t)}
          placeholder="答えを入力"
          placeholderTextColor="rgba(255,255,255,0.6)"
          keyboardType="numeric"
          returnKeyType="done"
          editable={!locked && status !== 'correct'}
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          style={[styles.submitButton, locked || status === 'correct' ? { opacity: 0.6 } : undefined]}
          onPress={() => {
            if (!locked && status !== 'correct') {
              handleSubmit();
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>確認</Text>
        </TouchableOpacity>
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
    marginTop: 20,
    alignItems: 'center'
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
  ,
  input: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center'
  },
  submitButton: {
    marginLeft: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
  ,
  progress: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8
  }
});

export default AlarmMathScreen;
