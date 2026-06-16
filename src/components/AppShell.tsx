import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, MessageCircle, Users, Store, History, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const NAV = [
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/community", label: "Communauté", icon: Users },
  { to: "/listings", label: "Annonces", icon: Store },
  { to: "/history", label: "Historique", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/chat" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span className="hidden sm:inline">Assistant Citoyen</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
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
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2">
              <LogOut className="size-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
