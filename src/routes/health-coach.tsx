import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Dumbbell, Moon, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/health-coach")({
  head: () => ({
    meta: [
      { title: "Coach Santé — SocialTown" },
      { name: "description", content: "Nutrition, sport, sommeil, méditation — ton coach personnel" },
    ],
  }),
  component: HealthCoachPage,
});

function HealthCoachPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-teal-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white inline-flex items-center justify-center">
              <Dumbbell className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Coach Santé</h1>
              <p className="text-sm text-muted-foreground">Nutrition, sport, sommeil, méditation</p>
            </div>
          </div>

          <Tabs defaultValue="nutrition" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nutrition">🍎 Nutrition</TabsTrigger>
              <TabsTrigger value="sport">⚽ Sport</TabsTrigger>
              <TabsTrigger value="sleep">😴 Sommeil</TabsTrigger>
              <TabsTrigger value="meditation">🧘 Méditation</TabsTrigger>
            </TabsList>

            <TabsContent value="nutrition" className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="flex items-start gap-3 mb-4">
                  <Zap className="size-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Plans nutritionnels</h3>
                    <p className="text-sm text-muted-foreground">Adaptés à tes objectifs</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline">💪 Prise de masse</Button>
                  <Button variant="outline">🏃 Endurance</Button>
                  <Button variant="outline">⚖️ Équilibré</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sport" className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="flex items-start gap-3 mb-4">
                  <Activity className="size-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Programmes d'entraînement</h3>
                    <p className="text-sm text-muted-foreground">Débutant à avancé</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline">🏋️ Musculation</Button>
                  <Button variant="outline">🏃 Cardio</Button>
                  <Button variant="outline">🤸 Flexibilité</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="flex items-start gap-3 mb-4">
                  <Moon className="size-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Optimise ton sommeil</h3>
                    <p className="text-sm text-muted-foreground">Conseils et suivi</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Durée recommandée: 7-9h par nuit</p>
                  <Button className="w-full">📊 Suivre mon sommeil</Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="meditation" className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="size-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Sessions de méditation</h3>
                    <p className="text-sm text-muted-foreground">Calme et sérénité</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline">🕐 5 min</Button>
                  <Button variant="outline">🕑 10 min</Button>
                  <Button variant="outline">🕒 20 min</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
