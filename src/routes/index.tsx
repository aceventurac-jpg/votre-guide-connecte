import { createFileRoute, Link } from '@tanstack/react-router';
import { Home, Search, Plus, MessageSquare, User, Heart, Hammer, Briefcase, CloudRain, Shield, Tv } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const univers = [
    { name: "Coach Santé", path: "/coach-sante", icon: Shield, color: "bg-[#00D4A8]", slogan: "Prends soin de toi" },
    { name: "Météo Intelligente", path: "/weather-smart", icon: CloudRain, color: "bg-[#38BDF8]", slogan: "L'app qui sait quoi mettre" },
    { name: "Covoiturage", path: "/covoiturage", icon: Home, color: "bg-[#6366F1]", slogan: "Roule ensemble" },
    { name: "BTP & Artisans", path: "/btp", icon: Hammer, color: "bg-[#D97706]", slogan: "Les bons pros" },
    { name: "Pro & Commerce", path: "/business", icon: Briefcase, color: "bg-[#0EA5E9]", slogan: "Échange malin" },
    { name: "Solidarité", path: "/solidarity", icon: Heart, color: "bg-[#EF4444]", slogan: "Ensemble c'est mieux" },
    { name: "Fil TV Vertical", path: "/tv-feed", icon: Tv, color: "bg-zinc-900 text-white", slogan: "Vidéos communauté" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#1E293B]">
      {/* Header fixe */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#00D4A8] to-[#7C3AED] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <span className="font-bold text-sm tracking-tight">Assistant Citoyen</span>
        </div>
        <div className="flex gap-3 text-slate-600">
          <Search className="w-5 h-5 cursor-pointer" />
          <MessageSquare className="w-5 h-5 cursor-pointer" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="p-6 bg-white border-b text-center space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">Vis mieux, là où tu es.</h1>
        <p className="text-xs text-slate-500">Citadin ou rural — connecté, engagé, malin.</p>
      </div>

      {/* Grille Ta vie en mieux */}
      <main className="p-4 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ta vie en mieux</h2>
        <div className="grid grid-cols-2 gap-3">
          {univers.map((u) => {
            const Icon = u.icon;
            return (
              <Link 
                key={u.path} 
                to={u.path} 
                className={`${u.color} p-4 rounded-2xl shadow-xs flex flex-col justify-between h-28 border border-black/5 hover:scale-[1.02] transition-transform`}
              >
                <Icon className="w-6 h-6 text-current opacity-90" />
                <div>
                  <div className="font-bold text-xs leading-none">{u.name}</div>
                  <div className="text-[10px] opacity-80 mt-1 leading-none truncate">{u.slogan}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Bottom Nav Fixe */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 shadow-lg">
        <Link to="/" className="flex flex-col items-center text-[#7C3AED] gap-0.5">
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-medium">Accueil</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center text-slate-400 gap-0.5">
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-medium">Découvrir</span>
        </Link>
        
        {/* Bouton Plus surélevé */}
        <div className="relative -top-3">
          <button className="w-12 h-12 bg-gradient-to-tr from-[#00D4A8] to-[#7C3AED] rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <Link to="/chat" className="flex flex-col items-center text-slate-400 gap-0.5">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-medium">Messages</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 gap-0.5">
          <User className="w-5 h-5" />
          <span className="text-[9px] font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
