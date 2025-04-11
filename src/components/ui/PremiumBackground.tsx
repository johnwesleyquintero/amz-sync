import React from 'react';
import { getPremiumClasses } from '../../lib/styles/premium-theme-utils';

interface PremiumBackgroundProps {
  children: React.ReactNode;
  withAccent?: boolean;
  className?: string;
  isDark?: boolean;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  children,
  withAccent = false,
  className = '',
  isDark = false,
}) => {
  const { background, pattern } = getPremiumClasses({ withAccent, isDark });

  return (
    <div
      className={`relative overflow-hidden rounded-lg transition-all duration-300 ${className}`}
      style={{
        background,
        backgroundImage: `${background}, ${pattern}`,
      }}
    >
      {/* Premium shadow effect */}
      <div className="absolute inset-0 shadow-inner pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
