import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette } from '../theme/colors';

interface Props {
  time: string;
  label: string;
  onGiveUp: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  showGiveUpButton?: boolean;
}

const AlarmFireLayout: React.FC<Props> = ({ time, label, onGiveUp, children, backgroundColor = palette.sunrise, showGiveUpButton = true }) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.label}>ALARM</Text>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.subLabel}>{label}</Text>

      <View style={styles.panel}>{children}</View>

      {showGiveUpButton && (
        <TouchableOpacity style={styles.dismiss} onLongPress={onGiveUp} activeOpacity={0.8}>
          <Text style={styles.dismissText}>長押しでギブアップ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
    fontSize: 16,
    textAlign: 'center'
  },
  panel: {
    width: '100%',
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 24
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

export default AlarmFireLayout;
