import React from 'react';
import { cn } from '@/lib/styles/theme-utils';

interface PremiumContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  withPattern?: boolean;
  withAccent?: boolean;
  children: React.ReactNode;
}

export function PremiumContainer({
  variant = 'light',
  withPattern = false,
  withAccent = false,
  className,
  children,
  ...props
}: PremiumContainerProps) {
  const baseClasses = variant === 'light' ? 'bg-premium-light' : 'bg-premium-dark';
  const patternClasses = withPattern ? 'bg-premium-pattern' : '';
  const accentClasses = withAccent ? 'bg-accent-overlay' : '';

  return (
    <div
      className={cn(
        baseClasses,
        patternClasses,
        accentClasses,
        'shadow-premium rounded-lg p-4',
        'transition-all duration-300 ease-in-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
