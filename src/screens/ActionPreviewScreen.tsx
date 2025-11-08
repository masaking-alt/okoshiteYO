import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlarmAction } from '../types';
import { palette, theme } from '../theme/colors';
import { actionMeta } from '../data/alarms';

interface Props {
  action: AlarmAction;
  onBack: () => void;
}

const ActionPreviewScreen: React.FC<Props> = ({ action, onBack }) => {
  const meta = actionMeta[action];

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>解除アクションをプレビュー</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={[styles.previewCard, { borderColor: badgeColor(action) }]}>
        <Text style={styles.previewLabel}>{meta.badge}</Text>
        <Text style={styles.previewTitle}>{meta.title}</Text>
        <Text style={styles.previewDescription}>{meta.description}</Text>
        <View style={styles.mockPanel}>
          {action === 'math' && (
            <>
              <Text style={styles.mockQuestion}>12 + 37 = ?</Text>
              <View style={styles.answerRow}>
                <Text style={styles.answerBox}>49</Text>
                <Text style={styles.answerBox}>59</Text>
                <Text style={styles.answerBox}>51</Text>
              </View>
            </>
          )}
          {action === 'shake' && (
            <>
              <Text style={styles.mockQuestion}>あと 37 シェイク！</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '32%' }]} />
              </View>
            </>
          )}
          {action === 'photo' && (
            <>
              <Text style={styles.mockQuestion}>玄関マットを撮ってください</Text>
              <View style={styles.photoFrame}>
                <Text style={styles.photoFrameText}>[ Camera Preview ]</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <Text style={styles.helperText}>このUIだけ先に用意して、後でネイティブAPIと接続できます。</Text>
    </View>
  );
};

const badgeColor = (action: AlarmAction) => {
  switch (action) {
    case 'math':
      return palette.sunrise;
    case 'photo':
      return palette.lavender;
    case 'shake':
    default:
      return palette.mint;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backText: {
    color: theme.textPrimary,
    fontSize: 22
  },
  toolbarTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  previewCard: {
    marginTop: 24,
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    backgroundColor: theme.card
  },
  previewLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    letterSpacing: 1.5
  },
  previewTitle: {
    color: theme.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12
  },
  previewDescription: {
    color: theme.textSecondary,
    marginTop: 8,
    lineHeight: 20
  },
  mockPanel: {
    marginTop: 24,
    backgroundColor: theme.cardMuted,
    borderRadius: 16,
    padding: 18
  },
  mockQuestion: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '600'
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  answerBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    textAlign: 'center',
    borderRadius: 12,
    backgroundColor: theme.card,
    color: theme.textPrimary,
    fontWeight: '700'
  },
  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: theme.card,
    marginTop: 16
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.mint
  },
  photoFrame: {
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.divider,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoFrameText: {
    color: theme.textSecondary
  },
  helperText: {
    color: theme.textSecondary,
    marginTop: 18,
    lineHeight: 20
  }
});

export default ActionPreviewScreen;
