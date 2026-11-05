import { ViewStyle } from 'react-native';

export const colors = {
  surface: '#f0fcf6',
  surfaceLow: '#eaf7f0',
  surfaceContainer: '#e4f1ea',
  surfaceHigh: '#dfebe5',
  surfaceHighest: '#d9e5df',
  card: '#ffffff',
  ink: '#131e1a',
  inkMuted: '#3d4a41',
  secondary: '#4e635a',
  outline: '#6d7a70',
  stroke: '#E8EEEA',
  primary: '#006a42',
  primaryContainer: '#008655',
  onPrimary: '#ffffff',
  mint: '#d0e8dc',
  onMint: '#0a1f18',
  highlight: '#62dd9e',
  tertiary: '#005da7',
  tertiaryContainer: '#2976c6',
  gold: '#E8B44A',
  goldText: '#8A5A10',
  lavender: '#9276D5',
  error: '#ba1a1a',
  apple: '#1c2b27',
  hero: '#0c6844',
  heroDeep: '#084e33',
  track: '#d7efe4',
  frame: '#d7ebe1',
};

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  body: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadow: { card: ViewStyle; lift: ViewStyle } = {
  card: {
    shadowColor: '#202b27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  lift: {
    shadowColor: '#202b27',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
};
