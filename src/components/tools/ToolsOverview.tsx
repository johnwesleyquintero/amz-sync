
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AmazonSellerTools from './AmazonSellerTools';
import { Wrench } from 'lucide-react';

interface ToolsOverviewProps {
  maxTools?: number;
  showViewAllButton?: boolean;
  className?: string;
}

const ToolsOverview: React.FC<ToolsOverviewProps> = ({ 
  maxTools = 4, 
  showViewAllButton = true,
  className = "" 
}) => {
  return (
    <div className={`p-6 bg-card rounded-lg border shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-burnt-sienna" />
          <h2 className="text-xl font-semibold">Amazon Seller Tools</h2>
        </div>
        
        {showViewAllButton && (
          <Link to="/tools">
            <Button variant="ghost" size="sm" className="text-shakespeare hover:text-shakespeare/80">
              View All Tools
            </Button>
          </Link>
        )}
      </div>
      
      <AmazonSellerTools 
        showCategories={false} 
        showTable={true} 
        showDetails={false}
        showCTA={false}
        maxTools={maxTools}
      />
    </div>
  );
};

export default ToolsOverview;
