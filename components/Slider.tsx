
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  color: 'red' | 'green' | 'orange';
  help?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, setValue, min, max, step, color, help }) => {
  const colorClasses = {
    red: 'accent-brand-red',
    green: 'accent-brand-green',
    orange: 'accent-brand-orange',
  };

  return (
    <div className="mb-4" title={help}>
      <div className="flex justify-between items-center mb-1">
        <label className="font-bold text-sm text-slate-600">{label}</label>
        <span className="text-sm font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClasses[color]}`}
      />
    </div>
  );
};

export default Slider;
