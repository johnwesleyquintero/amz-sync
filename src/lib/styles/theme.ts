import { type ClassValue } from 'clsx';

export const themeConfig = {
  colors: {
    brandBlue: '#146EB4',
    brandOrange: '#FF9900',
    textPrimary: '#333333',
  },
  gradients: {
    light: {
      premium: 'linear-gradient(135deg, rgba(20, 110, 180, 0.05), rgba(255, 153, 0, 0.05))',
      accent: 'linear-gradient(45deg, rgba(20, 110, 180, 0.1), rgba(255, 153, 0, 0.1))',
    },
    dark: {
      premium: 'linear-gradient(135deg, rgba(20, 110, 180, 0.15), rgba(255, 153, 0, 0.15))',
      accent: 'linear-gradient(45deg, rgba(20, 110, 180, 0.2), rgba(255, 153, 0, 0.2))',
    },
  },
  shadows: {
    light: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    dark: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  },
  patterns: {
    diagonal: `repeating-linear-gradient(
      45deg,
      rgba(20, 110, 180, 0.03) 0px,
      rgba(20, 110, 180, 0.03) 2px,
      transparent 2px,
      transparent 10px
    )`,
  },
};

export type ThemeConfig = typeof themeConfig;

// Utility function to get theme values
export const getThemeValue = <T extends keyof ThemeConfig>(category: T, ...path: string[]): string => {
  let value: any = themeConfig[category];
  for (const key of path) {
    value = value?.[key];
  }
  return value as string;
};
