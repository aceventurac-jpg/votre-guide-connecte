import { Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function UniverseFrame({ children }: { children: ReactNode }) {
  return (
    <div className="socialtown-universe min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3 text-primary">
            <ArrowLeft className="size-4" />
            <span className="font-display text-sm font-extrabold">SOCIALTOWN</span>
            <span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:inline">Community Plaza</span>
          </Link>
          <nav className="flex gap-2" aria-label="Navigation SocialTown">
            <Button asChild variant="ghost" size="icon"><Link to="/camera" aria-label="Caméra" title="Caméra"><Camera /></Link></Button>
            <Button asChild variant="outline" size="icon"><Link to="/settings" aria-label="Réglages SocialTown" title="Réglages SocialTown"><Settings /></Link></Button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}