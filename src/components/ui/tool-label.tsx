import React from 'react';

interface ToolLabelProps {
  title: string;
  description: string;
  status?: 'beta' | 'new' | string;
}

const ToolLabel: React.FC<ToolLabelProps> = ({ title, description, status }) => {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {status && (
          <span className="text-sm font-medium bg-blue-100 text-blue-800 rounded-full px-2.5 py-0.5">
            {status.toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default ToolLabel;
