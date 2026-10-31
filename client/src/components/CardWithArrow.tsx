import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CardWithArrowProps {
  pillText: string;
  pillColor?: string;
  title: string;
  description: string;
  bottomBgColor?: string;
  bottomContent?: React.ReactNode;
  onArrowClick?: () => void;
  className?: string;
}

export const CardWithArrow: React.FC<CardWithArrowProps> = ({
  pillText,
  pillColor = 'bg-zinc-100 text-zinc-700',
  title,
  description,
  bottomBgColor = 'bg-pastel-blue',
  bottomContent,
  onArrowClick,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-zinc-150 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header: Pill + Arrow Button */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-tight ${pillColor}`}
          >
            {pillText}
          </span>
          <button
            onClick={onArrowClick}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors"
            title="View Details"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight leading-snug mb-2">
          {title}
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">{description}</p>
      </div>

      {/* Playful / Pastel Visual Bottom Compartment (Reference image aesthetic) */}
      <div
        className={`w-full rounded-2xl p-5 ${bottomBgColor} flex flex-col justify-center transition-transform hover:scale-[1.01]`}
      >
        {bottomContent}
      </div>
    </div>
  );
};
