import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import ActionFeedback, { ActionFeedbackTone, SUCCESS_FEEDBACK_DURATION_MS } from '../components/ActionFeedback';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';

const TARGET_SHAKES = 50;
const SHAKE_THRESHOLD = 0.8;
const SHAKE_COOLDOWN_MS = 350;
const UPDATE_INTERVAL_MS = 100;

const AlarmShakeScreen: React.FC<FireProps> = ({
  time,
  onGiveUp,
  onBack,
  showBackButton,
}) => {
  const [shakeCount, setShakeCount] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [completedFeedback, setCompletedFeedback] = useState(false);
  const lastShakeAt = useRef(0);
  const completed = useRef(false);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let active = true;

    const start = async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!active) {
        return;
      }
      setSensorAvailable(available);
      if (!available) {
        return;
      }
      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = Math.abs(magnitude - 1);
        const now = Date.now();
        if (delta > SHAKE_THRESHOLD && now - lastShakeAt.current > SHAKE_COOLDOWN_MS) {
          lastShakeAt.current = now;
          setShakeCount((prev) => Math.min(prev + 1, TARGET_SHAKES));
        }
      });
    };

    start();

    return () => {
      active = false;
      subscription?.remove();
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shakeCount >= TARGET_SHAKES && !completed.current) {
      completed.current = true;
      setCompletedFeedback(true);
      completeTimerRef.current = setTimeout(() => {
        onGiveUp();
      }, SUCCESS_FEEDBACK_DURATION_MS);
    }
  }, [onGiveUp, shakeCount]);

  const remaining = Math.max(0, TARGET_SHAKES - shakeCount);
  const progressWidth = `${Math.min(100, (shakeCount / TARGET_SHAKES) * 100)}%` as `${number}%`;
  const feedback = useMemo<{ message: string; tone: ActionFeedbackTone }>(() => {
    if (completedFeedback) {
      return { message: '成功しました。アラームを解除します。', tone: 'success' };
    }
    if (!sensorAvailable) {
      return { message: '加速度センサーが使えません。別の解除方法を選んでください。', tone: 'error' };
    }
    if (shakeCount > 0) {
      return { message: `反応しています。残り ${remaining} 回振ってください。`, tone: 'info' };
    }
    return { message: '端末を大きく振るとカウントされます。', tone: 'info' };
  }, [completedFeedback, remaining, sensorAvailable, shakeCount]);

  return (
    <AlarmFireLayout
      time={time}
      label="端末を振って解除"
      onGiveUp={onGiveUp}
      onBack={onBack}
      showBackButton={showBackButton}
      backgroundColor="#FFD166"
      showGiveUpButton={false}
    >
      <Text style={styles.question}>残り {remaining} シェイク！</Text>
      {!sensorAvailable && <Text style={styles.hint}>この端末では加速度センサーが使えません。</Text>}
      <View style={styles.progressOuter}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <ActionFeedback message={feedback.message} tone={feedback.tone} />
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
  hint: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
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
