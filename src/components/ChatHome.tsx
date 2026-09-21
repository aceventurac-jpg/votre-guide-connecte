import React, { useState } from 'react';
import { Home, User, Sparkles, Info } from 'lucide-react';

export function ChatHome() {
  const [activeTab, setActiveTab] = useState('chat');
  const [verificationDone, setVerificationDone] = useState(false);

  const tabs = [
    { id: 'chat', name: "Chat IA" },
    { id: 'all', name: "Fil social" },
    { id: 'community', name: "Communauté" },
    { id: 'troc', name: "Troc" },
    { id: 'recipes', name: "Recettes" },
    { id: 'solutions', name: "Solutions" },
    { id: 'eco', name: "Éco" },
    { id: 'news', name: "Ce qui compte" },
    { id: 'sante', name: "Coach" },
    { id: 'meteo', name: "Météo" },
    { id: 'covoiturage', name: "Covoiture" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 text-[#1E293B]">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <span className="font-black text-sm tracking-tight text-slate-900">SocialTown</span>
        <button type="button" onClick={() => setActiveTab('profile')} className="p-1.5 hover:bg-slate-50 rounded-lg">
          <User className="w-4 h-4 text-slate-600" />
        </button>
      </header>

      {/* Onglets Défilants */}
      <div className="w-full overflow-hidden bg-white border-b sticky top-[53px] z-40">
        <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none">
          {tabs.map(t => (
            <button 
              key={t.id} 
              type="button" 
              onClick={() => setActiveTab(t.id)} 
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 ${activeTab === t.id ? 'bg-[#38BDF8]/10 text-[#0284c7] border-[#38BDF8]/30 font-bold' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu dynamique */}
      {activeTab === 'profile' ? (
        <div className="max-w-xl mx-auto p-4 space-y-4">
          <div className="bg-white border rounded-2xl p-6 text-center space-y-2">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto border relative">
              <User className="w-6 h-6 text-slate-400" />
              {verificationDone && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full px-1">✓</div>}
            </div>
            <h1 className="text-sm font-black text-slate-900">Towner</h1>
            <p className="text-[11px] text-slate-400">Statut : {verificationDone ? 'Vérifié' : 'Standard'}</p>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl flex gap-2 text-[11px] text-amber-900">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>L'inscription est libre et gratuite.</strong> Le badge de confiance n'est pas obligatoire pour utiliser l'application.</p>
          </div>
          <div className="bg-white border p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400">Badge de Confiance (Optionnel)</h3>
            <p className="text-xs text-slate-600">Il rassure la communauté pour le covoiturage ou le BTP. Un cliché de votre carte d'identité suffit.</p>
            <button type="button" onClick={() => setVerificationDone(!verificationDone)} className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl">
              {verificationDone ? 'Retirer le badge' : 'Scanner ma pièce d’identité 📸'}
            </button>
          </div>
        </div>
      ) : (
        <main className="p-4 max-w-2xl mx-auto space-y-4">
          <div className="text-center py-12 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-700">Espace ouvert</h2>
            <p className="text-[11px] text-slate-400 mt-1">Photographiez votre besoin ou décrivez-le simplement pour lutter contre l'illectronisme !</p>
          </div>
        </main>
      )}

      {/* Barre basse fixe */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 h-16 flex items-center justify-around shadow-lg">
        <button type="button" onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-0.5 ${activeTab !== 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}`}>
          <Home className="w-4 h-4" />
          <span className="text-[9px] font-medium">Accueil</span>
        </button>
        <button type="button" onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}`}>
          <User className="w-4 h-4" />
          <span className="text-[9px] font-medium">Profil</span>
        </button>
      </nav>
    </div>
  );
}
