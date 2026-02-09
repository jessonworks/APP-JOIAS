import React from 'react';
import { AspectRatio } from '../types';

interface Props {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<Props> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <span className="text-sm text-slate-400 w-full uppercase tracking-wider font-semibold">Formato (Feed / Stories)</span>
      
      <button
        onClick={() => onSelect(AspectRatio.SQUARE)}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2
          ${selected === AspectRatio.SQUARE 
            ? 'bg-gold-500 text-slate-900 border-gold-500 font-bold' 
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-gold-500'}`}
      >
        <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
        Feed (1:1)
      </button>

      <button
        onClick={() => onSelect(AspectRatio.STORY)}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2
          ${selected === AspectRatio.STORY
            ? 'bg-gold-500 text-slate-900 border-gold-500 font-bold' 
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-gold-500'}`}
      >
        <div className="w-3 h-5 border-2 border-current rounded-sm"></div>
        Stories (9:16)
      </button>
    </div>
  );
};
