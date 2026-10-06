import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Zap, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/solidarity")({
  head: () => ({
    meta: [
      { title: "Solidarité — SocialTown" },
      { name: "description", content: "Cagnottes et actions solidaires pour s'entraider" },
    ],
  }),
  component: SolidarityPage,
});

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  collected: number;
  donors: number;
  image: string;
  category: "medical" | "housing" | "emergency" | "other";
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    title: "Aide pour famille en détresse",
    description: "Famille de 4 personnes sans logement",
    goal: 5000,
    collected: 3200,
    donors: 47,
    image: "🏠",
    category: "housing",
  },
  {
    id: "2",
    title: "Frais médicaux urgents",
    description: "Intervention chirurgicale non couverte",
    goal: 8000,
    collected: 6800,
    donors: 89,
    image: "⚕️",
    category: "medical",
  },
  {
    id: "3",
    title: "Aide d'urgence catastrophe naturelle",
    description: "Suite aux inondations dans la région",
    goal: 10000,
    collected: 9200,
    donors: 156,
    image: "💧",
    category: "emergency",
  },
];

function SolidarityPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [totalImpact] = useState({
    campaigns: 47,
    donors: 1234,
    raised: 125000,
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-red-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 text-white inline-flex items-center justify-center">
              <Heart className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Solidarité</h1>
              <p className="text-sm text-muted-foreground">Cagnottes et actions solidaires</p>
            </div>
          </div>

          {/* Impact global */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center bg-red-50 border-red-200">
              <div className="text-3xl font-bold text-red-600">{totalImpact.campaigns}</div>
              <p className="text-xs text-muted-foreground">Cagnottes actives</p>
            </Card>
            <Card className="p-4 text-center bg-red-50 border-red-200">
              <div className="text-3xl font-bold text-red-600">{totalImpact.donors}</div>
              <p className="text-xs text-muted-foreground">Contributeurs</p>
            </Card>
            <Card className="p-4 text-center bg-red-50 border-red-200">
              <div className="text-3xl font-bold text-red-600">{totalImpact.raised}€</div>
              <p className="text-xs text-muted-foreground">Collectés</p>
            </Card>
          </div>

          {/* Cagnottes */}
          <h3 className="font-semibold mb-3">Cagnottes en cours</h3>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const progress = (campaign.collected / campaign.goal) * 100;
              return (
                <Card key={campaign.id} className="p-4 hover:border-accent transition">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="text-4xl">{campaign.image}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold line-clamp-1">{campaign.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {campaign.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-rose-600"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold">{campaign.collected}€ / {campaign.goal}€</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="size-3" /> {campaign.donors}
                    </span>
                  </div>

                  <Button className="w-full gap-2">
                    <Heart className="size-4" /> Contribuer
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Créer cagnotte */}
          <Card className="mt-8 p-6 bg-red-50 border-red-200 space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="size-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Lancer une cagnotte solidaire</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aide quelqu'un en détresse en organisant une cagnotte communautaire
                </p>
                <Button className="gap-2">
                  <Heart className="size-4" /> Créer une cagnotte
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
