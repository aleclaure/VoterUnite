import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightColors = {
  primary: 'hsl(221, 83%, 53%)', // #3B82F6
  primaryLight: 'hsl(221, 83%, 95%)', // Light blue background
  secondary: 'hsl(158, 64%, 52%)', // #34D399
  accent: 'hsl(262, 83%, 58%)', // #A855F7
  background: 'hsl(210, 20%, 98%)', // #F8FAFC
  surface: 'hsl(0, 0%, 100%)', // #FFFFFF
  text: 'hsl(222, 47%, 11%)', // #1E293B
  textMuted: 'hsl(215, 16%, 47%)', // #64748B
  border: 'hsl(214, 32%, 91%)', // #E2E8F0
  error: 'hsl(0, 84%, 60%)', // #EF4444
  success: 'hsl(158, 64%, 52%)', // #34D399
  successLight: 'hsl(158, 64%, 95%)', // Light green background
  warning: 'hsl(43, 96%, 56%)', // #FBBF24
};

const darkColors = {
  primary: 'hsl(221, 83%, 53%)',
  secondary: 'hsl(158, 64%, 52%)',
  accent: 'hsl(262, 83%, 58%)',
  background: 'hsl(222, 47%, 11%)',
  surface: 'hsl(217, 33%, 17%)',
  text: 'hsl(210, 20%, 98%)',
  textMuted: 'hsl(215, 16%, 65%)',
  border: 'hsl(217, 33%, 25%)',
  error: 'hsl(0, 84%, 60%)',
  success: 'hsl(158, 64%, 52%)',
  warning: 'hsl(43, 96%, 56%)',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

export { lightColors, darkColors };
