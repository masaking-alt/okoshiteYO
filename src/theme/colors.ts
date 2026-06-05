import { MD3LightTheme } from 'react-native-paper';

export const palette = {
  ink: '#1F1B16',
  slate: '#51443A',
  cloud: '#85746A',
  white: '#FFFFFF',
  sunrise: '#FF8A3D',
  sunriseDark: '#B84D10',
  mint: '#2F8E68',
  teal: '#2C6E63',
  lavender: '#6750A4',
  sky: '#F2F6FF',
  cream: '#FFF8F3',
  border: '#D8C2B7',
  black: '#000000'
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.sunriseDark,
    onPrimary: palette.white,
    primaryContainer: '#FFDCC8',
    onPrimaryContainer: '#391300',
    secondary: palette.teal,
    onSecondary: palette.white,
    secondaryContainer: '#CDEBE3',
    onSecondaryContainer: '#062019',
    tertiary: palette.lavender,
    onTertiary: palette.white,
    tertiaryContainer: '#E8DEFF',
    onTertiaryContainer: '#211044',
    background: palette.cream,
    onBackground: palette.ink,
    surface: palette.white,
    onSurface: palette.ink,
    surfaceVariant: '#F2E8E2',
    onSurfaceVariant: palette.slate,
    outline: palette.border,
    outlineVariant: '#E7D7CE',
    error: '#BA1A1A',
    onError: palette.white
  }
};

export const theme = {
  background: paperTheme.colors.background,
  card: paperTheme.colors.surface,
  cardMuted: paperTheme.colors.surfaceVariant,
  accent: paperTheme.colors.primary,
  accentSoft: paperTheme.colors.primaryContainer,
  textPrimary: paperTheme.colors.onSurface,
  textSecondary: paperTheme.colors.onSurfaceVariant,
  divider: paperTheme.colors.outlineVariant
};
