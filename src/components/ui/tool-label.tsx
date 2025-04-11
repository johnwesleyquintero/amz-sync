import React from 'react';

interface ToolLabelProps {
  title: string;
  description: string;
  status?: 'beta' | 'new' | 'live' | 'deprecated';
}

const ToolLabel: React.FC<ToolLabelProps> = ({ title, description, status }) => {
  return (
    <div className="mb-6 p-4 bg-background rounded-lg shadow-sm border border-border">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
        {status && (
          <span className="text-xs font-medium tracking-wide px-3 py-1 rounded-full bg-primary-light text-primary">
            {status.toUpperCase()}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-text-secondary text-base leading-relaxed">{description}</p>}
    </div>
  );
};

export default ToolLabel;
