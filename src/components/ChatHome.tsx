import React, { useState, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { MessageSquare, Users, ShoppingBag, Utensils, Wrench, Leaf, Newspaper, Shield, CloudRain, Car, Sparkles, Home, User, Plus, Send, Camera } from 'lucide-react';

export function ChatHome() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'chat', name: "Chat IA", icon: MessageSquare, path: '/' },
    { id: 'all', name: "Fil social", icon: Sparkles, path: '/social' },
    { id: 'community', name: "Communauté", icon: Users, path: '/community' },
    { id: 'troc', name: "Troc", icon: ShoppingBag, path: '/troc' },
    { id: 'recipes', name: "Recettes", icon: Utensils, path: '/recipes' },
    { id: 'solutions', name: "Solutions", icon: Wrench, path: '/solutions' },
    { id: 'eco', name: "Éco", icon: Leaf, path: '/eco' },
    { id: 'news', name: "Ce qui compte", icon: Newspaper, path: '/news' },
    { id: 'sante', name: "Coach", icon: Shield, path: '/coach-sante' },
    { id: 'meteo', name: "Météo", icon: CloudRain, path: '/weather-smart' },
    { id: 'covoiturage', name: "Covoiture", icon: Car, path: '/covoiturage' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !preview) return;
    setMessages(p => [...p, { id: Date.now(), text: input, role: 'user', image: preview || undefined }]);
    setInput('');
    setPreview(null);
    setTimeout(() => {
      setMessages(p => [...p, { id: Date.now() + 1, text: "✨ Assistant : Image et besoin reçus ! J'analyse le contenu pour vous simplifier la démarche et trouver les bonnes options locales.", role: 'assistant' }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 text-[#1E293B]">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#38BDF8] rounded-lg flex items-center justify-center text-white font-bold text-sm">V</div>
          <div className="flex flex-col"><span className="font-bold text-xs text-slate-400">Votre Guide</span><span className="font-black text-sm tracking-tight text-slate-900">SocialTown</span></div>
        </div>
      </header>

      <div className="w-full overflow-hidden bg-white border-b sticky top-[53px] z-40">
        <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none">
          {tabs.map(t => (
            <Link key={t.id} to={t.path} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all shrink-0 ${t.id === 'chat' ? 'bg-[#38BDF8]/10 text-[#0284c7] border-[#38BDF8]/30 font-bold' : 'bg-white text-slate-600 border-slate-200'}`}>
              <t.icon className={`w-3.5 h-3.5 ${t.id === 'chat' ? 'text-[#0284c7]' : 'text-slate-400'}`} />
              <span>{t.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="text-center py-4 bg-gradient-to-b from-purple-50/50 to-transparent rounded-2xl p-4 border border-dashed border-purple-100">
          <h2 className="text-sm font-bold text-purple-950 flex items-center justify-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-600" /> Le numérique en toute simplicité</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-normal">Photographiez un objet à donner, vos restes de frigo ou un besoin. L'IA s'occupe de tout pour vous !</p>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <button type="button" onClick={() => fileRef.current?.click()} className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto hover:bg-purple-200 shadow-xs"><Camera className="w-5 h-5" /></button>
              <p className="text-xs font-semibold text-slate-600">Cliquez sur l'appareil photo ou tchattez directement</p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-2 ${m.role === 'user' ? 'bg-[#38BDF8] text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'}`}>
                  {m.image && <img src={m.image} alt="Upload" className="w-full max-h-48 object-cover rounded-xl" />}
                  {m.text && <p className="leading-relaxed">{m.text}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-[#F8FAFC] to-transparent z-40 space-y-2">
        {preview && (
          <div className="max-w-2xl mx-auto relative w-16 h-16 bg-white p-1 border rounded-xl shadow-xs">
            <img src={preview} alt="Aperçu" className="w-full h-full object-cover rounded-lg" />
            <button type="button" onClick={() => setPreview(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
          </div>
        )}
        <form onSubmit={send} className="max-w-2xl mx-auto flex items-center gap-2">
          <input type="file" accept="image/*" capture="environment" ref={fileRef} className="hidden" onChange={handleFileChange} />
          <div className="relative flex-1">
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#38BDF8]"><Camera className="w-4 h-4" /></button>
            <input type="text" placeholder="Prenez une photo ou décrivez votre besoin simplement..." value={input} onChange={(e) => setInput(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs shadow-md focus:outline-none focus:border-[#38BDF8]" />
          </div>
          <button type="submit" className="p-3 bg-[#38BDF8] text-white rounded-xl shadow-md"><Send className="w-4 h-4" /></button>
        </form>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 h-16 flex items-center justify-around px-2 shadow-lg">
        <Link to="/" className="flex flex-col items-center text-[#38BDF8] gap-0.5"><Home className="w-4 h-4 stroke-[2.5]" /><span className="text-[9px] font-bold">Accueil</span></Link>
        <Link to="/community" className="flex flex-col items-center text-slate-400 gap-0.5"><Users className="w-4 h-4" /><span className="text-[9px] font-medium">Réseau</span></Link>
        <div className="relative -top-2"><button type="button" className="w-10 h-10 bg-[#38BDF8] rounded-full flex items-center justify-center text-white shadow-md"><Plus className="w-5 h-5" /></button></div>
        <Link to="/chat" className="flex flex-col items-center text-slate-400 gap-0.5"><MessageSquare className="w-4 h-4" /><span className="text-[9px] font-medium">Chat IA</span></Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 gap-0.5"><User className="w-4 h-4" /><span className="text-[9px] font-medium">Profil</span></Link>
      </nav>
    </div>
  );
}
