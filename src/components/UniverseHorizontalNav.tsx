import { Link, useLocation } from "@tanstack/react-router";
import { Dumbbell, Cloud, Car, Hammer, Store, Heart } from "lucide-react";

const UNIVERSES = [
  { to: "/health-coach", icon: Dumbbell, label: "Coach", color: "text-teal-600" },
  { to: "/weather", icon: Cloud, label: "Météo", color: "text-sky-600" },
  { to: "/carpool", icon: Car, label: "Covoiture", color: "text-indigo-600" },
  { to: "/btp", icon: Hammer, label: "BTP", color: "text-amber-600" },
  { to: "/business", icon: Store, label: "Pro", color: "text-cyan-600" },
  { to: "/solidarity", icon: Heart, label: "Solidarité", color: "text-red-600" },
] as const;

export function UniverseHorizontalNav() {
  const location = useLocation();

  return (
    <div className="bg-card border-b sticky top-14 z-40 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-2 min-w-min">
        {UNIVERSES.map(({ to, icon: Icon, label, color }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                active
                  ? `bg-secondary ${color}`
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
