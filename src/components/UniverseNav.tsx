import React from 'react';
import { Link } from '@tanstack/react-router';
import { Heart, Hammer, Briefcase, CloudRain, Shield, Sparkles } from 'lucide-react';

export function UniverseNav({ currentUniverse, iaSuggestion }: { currentUniverse: string, iaSuggestion?: string }) {
  const links = [
    { name: "Santé", path: "/coach-sante", icon: Shield, color: "text-[#00D4A8]" },
    { name: "Météo", path: "/weather-smart", icon: CloudRain, color: "text-[#38BDF8]" },
    { name: "BTP", path: "/btp", icon: Hammer, color: "text-[#D97706]" },
    { name: "Commerce", path: "/business", icon: Briefcase, color: "text-[#0EA5E9]" },
    { name: "Solidarité", path: "/solidarity", icon: Heart, color: "text-[#EF4444]" },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 p-3 space-y-3 sticky top-14 z-40 shadow-xs">
      {/* Liens horizontaux défilants */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentUniverse === link.name;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                isActive 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : link.color}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bulle flottante de suggestion IA contextuelle */}
      {iaSuggestion && (
        <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl flex gap-2 items-center text-[11px] text-purple-950 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <p className="leading-tight"><strong>L'IA suggère :</strong> {iaSuggestion}</p>
        </div>
      )}
    </div>
  );
}
