import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaType?: 'percent' | 'absolute';
  isInverse?: boolean; // Lower is better
  unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, delta, deltaType = 'percent', isInverse = false, unit = '' }) => {
  const hasDelta = delta !== undefined && !isNaN(delta) && isFinite(delta);
  
  let formattedDelta = '';
  let deltaColor = 'text-slate-500';

  if (hasDelta) {
    let deltaSign = delta > 0 ? '+' : '';

    if ((delta > 0 && isInverse) || (delta < 0 && !isInverse)) {
      deltaColor = 'text-red-500';
    } else if ((delta < 0 && isInverse) || (delta > 0 && !isInverse)) {
      deltaColor = 'text-green-500';
      deltaSign = isInverse ? '' : '+'; // In inverse, negative delta is good.
    }
    
    formattedDelta = deltaType === 'percent'
      ? `${deltaSign}${isInverse ? (-delta).toFixed(0) : delta.toFixed(0)}%`
      : `${deltaSign}${isInverse ? (-delta).toFixed(2) : delta.toFixed(2)}${unit}`;
  }

  return (
    <div className="bg-slate-100 p-4 rounded-lg shadow-sm border border-slate-200 text-center">
      <h4 className="text-sm font-semibold text-slate-500 truncate">{title}</h4>
      <p className="text-2xl font-bold text-slate-800 my-1">{value}</p>
      {hasDelta && (
        <span className={`text-sm font-semibold ${deltaColor}`}>
          {formattedDelta}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
