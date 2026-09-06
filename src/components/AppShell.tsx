import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, MessageCircle, Users, Store, History, LogOut, LogIn, Home, BookOpen, Target, HandHeart, PawPrint, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useIsAuthed } from "@/hooks/use-auth";
import type { ReactNode } from "react";

const NAV = [
  { to: "/chat", label: "Chat", icon: MessageCircle, authOnly: false },
  { to: "/community", label: "Communauté", icon: Users, authOnly: false },
  { to: "/listings", label: "Annonces", icon: Store, authOnly: false },
  { to: "/forum", label: "Entraide", icon: HandHeart, authOnly: false },
  { to: "/pets", label: "Animaux", icon: PawPrint, authOnly: false },
  { to: "/troc", label: "Troc", icon: Gift, authOnly: false },
  { to: "/recipes", label: "Recettes", icon: BookOpen, authOnly: true },
  { to: "/goals", label: "Objectifs", icon: Target, authOnly: true },
  { to: "/history", label: "Historique", icon: History, authOnly: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { authed } = useIsAuthed();

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
            <div className="size-8 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span className="hidden sm:inline">Assistant Citoyen</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.filter((n) => !n.authOnly || authed).map((n) => {
              const active = location.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
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
            {authed === true && (
              <Button variant="ghost" size="sm" onClick={signOut} className="ml-2" title="Se déconnecter">
                <LogOut className="size-4" />
              </Button>
            )}
          </nav>
        </div>
      </header>
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
