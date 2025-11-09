import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette } from '../theme/colors';

interface Props {
  mode: 'math' | 'shake' | 'photo' | 'random';
  onComplete: () => void;
}

const AlarmDemoScreen: React.FC<Props> = ({ mode, onComplete }) => {
  return (
    <View style={[styles.container, backgroundStyle(mode)]}>
      <Text style={styles.label}>ALARM</Text>
      <Text style={styles.time}>05:30</Text>
      <Text style={styles.subLabel}>{modeLabel(mode)}</Text>

      <View style={styles.panel}>{renderContent(mode)}</View>

      <TouchableOpacity style={styles.dismiss} onLongPress={onComplete} activeOpacity={0.8}>
        <Text style={styles.dismissText}>長押しでギブアップ</Text>
      </TouchableOpacity>
    </View>
  );
};

const modeLabel = (mode: Props['mode']) => {
  switch (mode) {
    case 'math':
      return '計算を解かないと止まらない';
    case 'shake':
      return '50回シェイクして覚醒';
    case 'photo':
      return '証拠ショットで解除';
    default:
      return 'ランダムミッション';
  }
};

const renderContent = (mode: Props['mode']) => {
  if (mode === 'math' || mode === 'random') {
    return (
      <>
        <Text style={styles.question}>12 + 37 = ?</Text>
        <View style={styles.answerRow}>
          {['49', '59', '51'].map((ans) => (
            <View key={ans} style={styles.answerBox}>
              <Text style={styles.answerText}>{ans}</Text>
            </View>
          ))}
        </View>
      </>
    );
  }
  if (mode === 'shake') {
    return (
      <>
        <Text style={styles.question}>残り 37 シェイク！</Text>
        <View style={styles.progressOuter}>
          <View style={styles.progressFill} />
        </View>
      </>
    );
  }
  return (
    <>
      <Text style={styles.question}>証拠写真を撮影</Text>
      <View style={styles.cameraBox}>
        <Text style={styles.cameraText}>[ CAMERA ]</Text>
      </View>
    </>
  );
};

const backgroundStyle = (mode: Props['mode']) => ({
  backgroundColor: mode === 'shake' ? '#FFD166' : mode === 'photo' ? '#FF70A6' : palette.sunrise
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  label: {
    color: '#fff',
    letterSpacing: 4,
    fontWeight: '600'
  },
  time: {
    color: '#fff',
    fontSize: 80,
    fontWeight: '800'
  },
  subLabel: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16
  },
  panel: {
    width: '100%',
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 24
  },
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
  dismiss: {
    position: 'absolute',
    bottom: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  dismissText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1
  }
});

export default AlarmDemoScreen;
