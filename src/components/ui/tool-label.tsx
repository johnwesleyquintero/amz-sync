import React from 'react';

interface ToolLabelProps {
  title: string;
  description: string;
  status?: 'beta' | 'new' | 'live' | 'deprecated';
}

const ToolLabel: React.FC<ToolLabelProps> = ({ title, description, status }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {status && (
          <span className="text-xs font-medium tracking-wide px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {status.toUpperCase()}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-gray-600 text-base leading-relaxed">{description}</p>}
    </div>
  );
};

export default ToolLabel;
