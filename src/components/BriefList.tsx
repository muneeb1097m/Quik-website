import { Brief } from '@/types';
import { List } from 'lucide-react';

interface BriefListProps {
  brief: Brief;
}

export function BriefList({ brief }: BriefListProps) {
  return (
    <div className="rounded-2xl bg-white/40 border border-white/60 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 text-slate-700">
        <div className="p-1 bg-purple-100 rounded text-purple-600">
          <List className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Intelligence Brief</h4>
      </div>
      <ul className="space-y-4">
        {brief.bulletPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-4 text-sm text-slate-600 leading-relaxed font-medium">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)] shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
