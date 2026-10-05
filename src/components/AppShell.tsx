import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, MessageCircle, Users, Store, History, LogOut, LogIn, Home, BookOpen, Target, HandHeart, PawPrint, Gift, Mail, Flame, Briefcase, Leaf, Dumbbell, Cloud, Car, Hammer, Heart, Newspaper, AlertCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useIsAuthed } from "@/hooks/use-auth";
import { NotificationsBell } from "@/components/NotificationsBell";
import { GradientHexagonLogo } from "@/components/GradientHexagonLogo";
import { UniverseHorizontalNav } from "@/components/UniverseHorizontalNav";
import type { ReactNode } from "react";

const NAV = [
  { to: "/social", label: "Fil social", icon: Flame, authOnly: false },
  { to: "/chat", label: "Chat", icon: MessageCircle, authOnly: false },
  { to: "/community", label: "Communauté", icon: Users, authOnly: false },
  { to: "/troc", label: "Troc", icon: Gift, authOnly: false },
  { to: "/recipes", label: "Recettes", icon: BookOpen, authOnly: false },
  { to: "/solutions", label: "Solutions", icon: Briefcase, authOnly: false },
  { to: "/eco", label: "Éco", icon: Leaf, authOnly: false },
  { to: "/whats-important", label: "Ce qui compte", icon: AlertCircle, authOnly: false },
  { to: "/news", label: "Actualités", icon: Newspaper, authOnly: false },
  { to: "/health-coach", label: "Coach", icon: Dumbbell, authOnly: false },
  { to: "/weather", label: "Météo", icon: Cloud, authOnly: false },
  { to: "/carpool", label: "Covoiture", icon: Car, authOnly: false },
  { to: "/btp", label: "BTP", icon: Hammer, authOnly: false },
  { to: "/business", label: "Pro", icon: Store, authOnly: false },
  { to: "/solidarity", label: "Solidarité", icon: Heart, authOnly: false },
  { to: "/listings", label: "Annonces", icon: Store, authOnly: false },
  { to: "/forum", label: "Entraide", icon: HandHeart, authOnly: false },
  { to: "/pets", label: "Animaux", icon: PawPrint, authOnly: false },
  { to: "/messages", label: "Messages", icon: Mail, authOnly: true },
  { to: "/goals", label: "Objectifs", icon: Target, authOnly: true },
  { to: "/history", label: "Historique", icon: History, authOnly: true },
  { to: "/news-preferences", label: "Préférences", icon: Settings, authOnly: true },
] as const;

// Pages avec la barre d'univers horizontale
const UNIVERSE_NAV_PAGES = ["/health-coach", "/weather", "/carpool", "/btp", "/business", "/solidarity"];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { authed } = useIsAuthed();
  const showUniverseNav = UNIVERSE_NAV_PAGES.some((p) => location.pathname.startsWith(p));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <GradientHexagonLogo className="size-8" />
            <span className="hidden sm:inline">Votre Guide</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.filter((n) => !n.authOnly || authed).map((n) => {
              const active = location.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
            {authed === false && (
              <Link to="/auth">
                <Button variant="default" size="sm" className="ml-2">
                  <LogIn className="size-4 mr-1" /> <span className="hidden sm:inline">Connexion</span>
                </Button>
              </Link>
            )}
            {authed === true && <NotificationsBell />}
            {authed === true && (
              <Button variant="ghost" size="sm" onClick={signOut} className="ml-2" title="Se déconnecter">
                <LogOut className="size-4" />
              </Button>
            )}
          </nav>
        </div>
      </header>
      {showUniverseNav && <UniverseHorizontalNav />}
      <main className="flex-1 flex flex-col">{children}</main>
      {location.pathname !== "/" && (
        <Link
          to="/"
          aria-label="Retour à l'accueil"
          className="fixed bottom-5 right-5 z-20 size-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 inline-flex items-center justify-center hover:scale-105 transition"
        >
          <Home className="size-5" />
        </Link>
      )}
    </div>
  );
}
