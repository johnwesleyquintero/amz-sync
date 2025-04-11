import { brandBlue, brandOrange } from './theme';

// Premium theme utility functions
export const generatePremiumGradient = (opacity: number = 0.05) => {
  return `linear-gradient(135deg, ${adjustOpacity(brandBlue, opacity)}, ${adjustOpacity(brandOrange, opacity)})`;
};

export const generateAccentOverlay = (opacity: number = 0.1) => {
  return `linear-gradient(45deg, ${adjustOpacity(brandBlue, opacity)}, ${adjustOpacity(brandOrange, opacity)})`;
};

export const generateDiagonalPattern = (color: string = brandBlue, opacity: number = 0.05) => {
  const adjustedColor = adjustOpacity(color, opacity);
  return `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    ${adjustedColor} 10px,
    ${adjustedColor} 11px
  )`;
};

// Helper function to adjust color opacity
const adjustOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Premium theme class generator
export const getPremiumClasses = ({
  withAccent = false,
  isDark = false,
}: {
  withAccent?: boolean;
  isDark?: boolean;
}) => {
  const baseOpacity = isDark ? 0.15 : 0.05;
  const accentOpacity = isDark ? 0.2 : 0.1;

  return {
    background: withAccent ? generateAccentOverlay(accentOpacity) : generatePremiumGradient(baseOpacity),
    pattern: generateDiagonalPattern(brandBlue, baseOpacity / 2),
  };
};
