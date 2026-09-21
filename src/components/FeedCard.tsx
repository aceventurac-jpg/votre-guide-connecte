import React from 'react';
import { CheckCircle2 } from 'lucide-react';
export function FeedCard({ i }: { i: any }) {
  return (
    <div className='bg-white border rounded-xl p-3 shadow-xs space-y-2 flex flex-col'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-1'><h3 className='text-xs font-bold text-slate-900'>{i.title}</h3><CheckCircle2 className='w-3 h-3 text-blue-500 shrink-0' /></div>
        <span className='text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-50 border text-slate-500'>{i.badge}</span>
      </div>
      <p className='text-xs text-slate-600 leading-tight'>{i.desc}</p>
    </div>
  );
}
