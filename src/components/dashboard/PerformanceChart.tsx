// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\dashboard\PerformanceChart.tsx
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps, // Import TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'; // Import types for Tooltip content

// Updated interface to match the data structure used in Index.tsx
interface ChartData {
  name: string; // Corresponds to 'name' (e.g., 'Jan 1')
  impressions: number;
  revenue: number; // Changed from clicks/conversions to revenue
}

interface PerformanceChartProps {
  data: ChartData[];
}

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      // Use popover styles for the tooltip background/text
      <div className="rounded-lg border bg-popover p-2 shadow-sm text-popover-foreground">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
            {`${entry.name}: ${entry.value?.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Define colors using CSS variables (will be resolved at runtime)
  // Using primary for impressions and accent for revenue as an example
  const primaryColor = 'hsl(var(--primary))';
  const accentColor = 'hsl(var(--accent))';
  const mutedForeground = 'hsl(var(--muted-foreground))';
  const border = 'hsl(var(--border))';

  return (
    // analytics-card applies bg-card, text-card-foreground from index.css
    // Increased height slightly for better spacing
    <div className="analytics-card h-[380px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Campaign Performance</h3>
        {/* Apply theme styles to the select dropdown */}
        <select
          className="text-sm border border-input rounded px-2 py-1 bg-input text-foreground focus:ring-1 focus:ring-ring focus:border-ring outline-none"
          defaultValue="Last 7 days" // Set a default value
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {/* Gradient using primary color */}
            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
            </linearGradient>
            {/* Gradient using accent color */}
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          {/* Use theme border color for grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={border} />
          {/* Use theme muted foreground color for axis text */}
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke={mutedForeground}
          />
          <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={mutedForeground} />
          {/* Use custom tooltip component */}
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="impressions"
            name="Impressions" // Add name for tooltip
            stroke={primaryColor} // Use primary color for stroke
            fillOpacity={1}
            fill="url(#colorImpressions)"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue" // Add name for tooltip
            stroke={accentColor} // Use accent color for stroke
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
