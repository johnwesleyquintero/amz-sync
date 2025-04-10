// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\dashboard\StatCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode; // The icon element itself, color should be set where used
  className?: string;
}

const StatCard = ({ title, value, change = 0, icon, className }: StatCardProps) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    // analytics-card applies bg-card, text-card-foreground, etc. from index.css
    <div className={cn('analytics-card', className)}>
      <div className="flex justify-between items-start">
        <div>
          {/* stat-label uses text-muted-foreground */}
          <p className="stat-label">{title}</p>
          {/* dashboard-stat uses text-primary */}
          <h3 className="dashboard-stat mt-1">{value}</h3>

          {change !== undefined && (
            <div className="flex items-center mt-2">
              {!isNeutral &&
                (isPositive ? (
                  // trend-up uses text-success
                  <ArrowUpIcon className="h-4 w-4 mr-1 trend-up" />
                ) : (
                  // trend-down uses text-error
                  <ArrowDownIcon className="h-4 w-4 mr-1 trend-down" />
                ))}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive
                    ? 'trend-up' // Uses text-success
                    : isNeutral
                      ? 'text-muted-foreground' // Uses theme variable
                      : 'trend-down' // Uses text-error
                )}
              >
                {isPositive && '+'}
                {change}%
              </span>
            </div>
          )}
        </div>

        {/* Use primary-light background for the icon container */}
        <div className="p-2 rounded-md bg-primary-light dark:bg-primary/20">
          {' '}
          {/* Replaced bg-iceberg */}
          {/* Icon color (e.g., text-primary) should be applied to the icon element passed in */}
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
