// c:\Users\johnw\OneDrive\Desktop\my-amazon-analytics\src\components\dashboard\CampaignStatus.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'warning';
  budget: number;
  spent: number;
}

interface CampaignStatusProps {
  campaigns: Campaign[];
}

const CampaignStatus: React.FC<CampaignStatusProps> = ({ campaigns }) => {
  // Function to get the appropriate icon based on status
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        // Use success color for active icon
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'paused':
        // Use muted color for paused icon
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'warning':
        // Use warning color for warning icon
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  // Function to get the display text for the status
  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'warning':
        return 'Warning';
      default:
        return '';
    }
  };

  return (
    // analytics-card applies bg-card, text-card-foreground from index.css
    <div className="analytics-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Campaign Status</h3>
        {/* Use primary color for the link/button */}
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {campaigns.map(campaign => (
          // Use theme border color
          <div key={campaign.id} className="p-3 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Use muted background for avatar */}
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-sm font-bold">{campaign.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{campaign.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(campaign.status)}
                    <span
                      className={cn(
                        'text-xs',
                        // Apply theme colors based on status
                        campaign.status === 'active'
                          ? 'text-success' // Use success color
                          : campaign.status === 'paused'
                            ? 'text-muted-foreground' // Use muted color
                            : 'text-warning' // Use warning color
                      )}
                    >
                      {getStatusText(campaign.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">${campaign.spent.toLocaleString()}</p>
                {/* Use muted foreground for secondary text */}
                <p className="text-xs text-muted-foreground">
                  of ${campaign.budget.toLocaleString()} budget
                </p>
              </div>
            </div>

            <div className="mt-3">
              {/* Use muted background for progress bar track */}
              <div className="h-2 bg-muted rounded-full">
                <div
                  className={cn(
                    'h-full rounded-full',
                    // Apply theme colors for progress bar fill
                    campaign.status === 'active'
                      ? 'bg-success' // Use success color
                      : campaign.status === 'paused'
                        ? 'bg-muted' // Use muted color (gray) for paused
                        : 'bg-warning' // Use warning color
                  )}
                  style={{ width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignStatus;
