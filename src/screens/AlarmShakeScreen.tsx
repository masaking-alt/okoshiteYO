import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { Accelerometer } from 'expo-sensors';
import AlarmFireLayout from '../components/AlarmFireLayout';
import { FireProps } from './fire/types';
import { palette } from '../theme/colors';

const TARGET_SHAKES = 50;
const SHAKE_THRESHOLD = 0.8;
const SHAKE_COOLDOWN_MS = 350;
const UPDATE_INTERVAL_MS = 100;

const AlarmShakeScreen: React.FC<FireProps> = ({ time, onGiveUp, onBack, showBackButton }) => {
  const [shakeCount, setShakeCount] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const lastShakeAt = useRef(0);
  const completed = useRef(false);

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
    };
  }, []);

  useEffect(() => {
    if (shakeCount >= TARGET_SHAKES && !completed.current) {
      completed.current = true;
      onGiveUp();
    }
  }, [onGiveUp, shakeCount]);

  const remaining = Math.max(0, TARGET_SHAKES - shakeCount);
  const progress = Math.min(1, shakeCount / TARGET_SHAKES);

  return (
    <AlarmFireLayout
      time={time}
      label="端末を振って解除"
      onGiveUp={onGiveUp}
      onBack={onBack}
      showBackButton={showBackButton}
      backgroundColor={palette.teal}
      showGiveUpButton={false}
    >
      <Text variant="headlineSmall" style={styles.question}>
        残り {remaining} シェイク
      </Text>
      {!sensorAvailable && (
        <Text variant="bodySmall" style={styles.hint}>
          この端末では加速度センサーが使えません。
        </Text>
      )}
      <ProgressBar progress={progress} color="#fff" style={styles.progressBar} />
      <Text variant="labelLarge" style={styles.counter}>
        {shakeCount} / {TARGET_SHAKES}
      </Text>
    </AlarmFireLayout>
  );
};

const styles = StyleSheet.create({
  question: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center'
  },
  hint: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center'
  },
  progressBar: {
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
    marginTop: 22
  },
  counter: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    fontVariant: ['tabular-nums']
  }
});

export default AlarmShakeScreen;
