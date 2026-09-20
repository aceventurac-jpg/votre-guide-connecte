import React, { useState } from 'react';
import { Newspaper, Sparkles, MapPin, Flame } from 'lucide-react';

export function NewsView() {
  const [articles] = useState([
    { id: 1, title: "Grand Lille : Nouveaux projets de pistes cyclables entre Roubaix et Leers", source: "La Voix du Nord", type: "Local", summary: "L'IA résume : Amélioration majeure des liaisons douces pour les citadins d'ici fin 2026." },
    { id: 2, title: "Lancement d'une initiative nationale pour l'isolation des bâtiments", source: "Le Monde", type: "Écologie", summary: "L'IA résume : Nouvelles aides financières débloquées pour les rénovations énergétiques globales." },
    { id: 3, title: "Économie numérique : Les plateformes locales en plein essor", source: "Les Échos", type: "Économie", summary: "L'IA résume : Les circuits courts digitaux gagnent 15% de parts de marché cette année." }
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 pb-24">
      {/* Header */}
      <div className="border-b border-zinc-800 p-6 text-center bg-zinc-900/50">
        <h1 className="text-xl font-extrabold flex items-center justify-center gap-2 text-sky-400">
          <Newspaper /> Ce qui compte
        </h1>
        <p className="text-xs text-zinc-400 mt-1">"L'actualité essentielle, sans le bruit"</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Carrousel à la une (Top 5) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-500" /> À la une (Boost Local Leers)
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x">
            {articles.map(art => (
              <div key={art.id} className="min-w-[280px] max-w-[280px] bg-zinc-900 border border-zinc-800 p-4 rounded-2xl snap-center space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                  <span>{art.source}</span>
                  <span className="bg-sky-950 text-sky-400 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {art.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-2">{art.title}</h4>
                <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/50 flex gap-1.5 items-start">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-300 leading-tight italic">{art.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste Filtrable */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mon Fil d'actualités (70% Préférences)</h3>
          <div className="space-y-3">
            {articles.map(art => (
              <div key={art.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="text-[10px] font-semibold text-zinc-400">{art.source} • {art.type}</div>
                <h4 className="text-xs font-bold text-zinc-200">{art.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{art.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
