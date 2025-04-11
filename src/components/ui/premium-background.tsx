import React from 'react';
import { cn } from '@/lib/utils';
import { getThemeValue } from '@/lib/styles/theme';
import '@/lib/styles/design-system.css';

interface PremiumBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isDark?: boolean;
  withPattern?: boolean;
  withAccent?: boolean;
}

export function PremiumBackground({
  children,
  className,
  isDark = false,
  withPattern = false,
  withAccent = false,
  ...props
}: PremiumBackgroundProps) {
  const themeMode = isDark ? 'dark' : 'light';
  const baseClass = isDark ? 'bg-premium-dark' : 'bg-premium-light';
  const accentClass = isDark ? 'bg-accent-overlay-dark' : 'bg-accent-overlay-light';
  const shadowClass = isDark ? 'shadow-premium-dark' : 'shadow-premium-light';
  const gradientClass = withAccent ? accentClass : baseClass;
  const patternClass = withPattern ? 'bg-pattern' : '';

  return (
    <div
      className={cn(
        gradientClass,
        patternClass,
        shadowClass,
        'transition-premium rounded-lg p-4',
        className
      )}
      style={{
        ...(withPattern && {
          backgroundImage: getThemeValue('patterns', 'diagonal'),
        }),
      }}
      {...props}
    >
      {children}
    </div>
  );
}
