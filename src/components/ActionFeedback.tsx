import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type ActionFeedbackTone = 'info' | 'success' | 'error';

export const SUCCESS_FEEDBACK_DURATION_MS = 350;
export const RETRY_FEEDBACK_DURATION_MS = 3000;

type Props = {
  message: string;
  tone?: ActionFeedbackTone;
};

const toneStyles: Record<ActionFeedbackTone, { backgroundColor: string; borderColor: string }> = {
  info: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.36)'
  },
  success: {
    backgroundColor: 'rgba(43, 211, 107, 0.24)',
    borderColor: 'rgba(144, 255, 190, 0.72)'
  },
  error: {
    backgroundColor: 'rgba(255, 89, 94, 0.24)',
    borderColor: 'rgba(255, 190, 190, 0.72)'
  }
};

const ActionFeedback: React.FC<Props> = ({ message, tone = 'info' }) => {
  return (
    <View style={[styles.container, toneStyles[tone]]} accessibilityLiveRegion="polite">
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  message: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center'
  }
});

export default ActionFeedback;
