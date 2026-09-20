import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Leaf, Calendar, MapPin, Users, Plus, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/eco")({
  head: () => ({
    meta: [
      { title: "Action Éco — Assistant Citoyen" },
      { name: "description", content: "Rejoins les actions éco locales, crée tes événements en 3 clics." },
    ],
  }),
  component: EcoPage,
});

interface EcoEvent {
  id: string;
  title: string;
  description: string;
  category: "nettoyage" | "plantation" | "recyclage" | "autre";
  date: string;
  time: string;
  location: string;
  participants: number;
  image: string;
  joined: boolean;
}

interface EcoAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  count: number;
  unit: string;
}

const DEMO_EVENTS: EcoEvent[] = [
  {
    id: "1",
    title: "Nettoyage Parc Monceau",
    description: "Grand nettoyage du parc avec ramassage des déchets",
    category: "nettoyage",
    date: "2026-09-20",
    time: "09:00",
    location: "Paris 8e",
    participants: 24,
    image: "🌍",
    joined: false,
  },
  {
    id: "2",
    title: "Plantation arbres fruitiers",
    description: "Plante des arbres fruitiers pour la communauté",
    category: "plantation",
    date: "2026-09-27",
    time: "10:00",
    location: "Bois de Boulogne",
    participants: 18,
    image: "🌳",
    joined: false,
  },
  {
    id: "3",
    title: "Collecte textile et électronique",
    description: "Recyclage d'habits et appareils électriques",
    category: "recyclage",
    date: "2026-09-21",
    time: "14:00",
    location: "Centre culturel 13e",
    participants: 31,
    image: "♻️",
    joined: false,
  },
];

const DEMO_ACTIONS: EcoAction[] = [
  {
    id: "1",
    title: "Déchet ramassé",
    description: "kg de déchets collectés",
    icon: "🗑️",
    count: 1247,
    unit: "kg",
  },
  {
    id: "2",
    title: "Arbres plantés",
    description: "pour un futur verdoyant",
    icon: "🌱",
    count: 342,
    unit: "arbres",
  },
  {
    id: "3",
    title: "Personnes mobilisées",
    description: "qui agissent localement",
    icon: "👥",
    count: 3456,
    unit: "personnes",
  },
];

function EventCard({ event, onJoin }: { event: EcoEvent; onJoin: (event: EcoEvent) => void }) {
  return (
    <Card className="overflow-hidden hover:border-accent transition">
      <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center text-4xl">
        {event.image}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <p className="text-sm text-muted-foreground">{event.description}</p>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            {new Date(event.date).toLocaleDateString("fr-FR")} à {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            {event.participants} participants
          </div>
        </div>

        <Button
          onClick={() => onJoin(event)}
          variant={event.joined ? "outline" : "default"}
          className="w-full"
        >
          {event.joined ? "✓ J'y participe" : "Je participe"}
        </Button>
      </div>
    </Card>
  );
}

function EcoPage() {
  const [events, setEvents] = useState<EcoEvent[]>(DEMO_EVENTS);
  const [actions] = useState<EcoAction[]>(DEMO_ACTIONS);
  const [createStep, setCreateStep] = useState<0 | 1 | 2 | 3>(0);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const [activeTab, setActiveTab] = useState("events");

  function handleJoinEvent(event: EcoEvent) {
    setEvents(
      events.map((e) =>
        e.id === event.id
          ? { ...e, joined: !e.joined, participants: e.joined ? e.participants - 1 : e.participants + 1 }
          : e
      )
    );
  }

  function createNewEvent() {
    if (newEvent.title && newEvent.date && newEvent.location) {
      const freshEvent: EcoEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: "Mon événement éco",
        category: "autre",
        date: newEvent.date,
        time: "14:00",
        location: newEvent.location,
        participants: 1,
        image: "🌍",
        joined: true,
      };
      setEvents([freshEvent, ...events]);
      setNewEvent({ title: "", date: "", location: "" });
      setCreateStep(0);
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl w-full mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white inline-flex items-center justify-center">
              <Leaf className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Action Éco</h1>
              <p className="text-sm text-muted-foreground">Rejoins les actions locales, crée tes événements</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="impact">Impact global</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="create">Créer</TabsTrigger>
            </TabsList>

            {/* Impact Global */}
            <TabsContent value="impact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action) => (
                  <Card key={action.id} className="p-6 text-center space-y-4 border-2 border-accent/20 hover:border-accent/50 transition">
                    <div className="text-6xl">{action.icon}</div>
                    <div>
                      <div className="text-3xl font-bold text-accent flex items-center justify-center gap-2">
                        <TrendingUp className="size-5" />
                        {action.count.toLocaleString()}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{action.unit}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.title}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-accent/5 border-accent/20 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Leaf className="size-5 text-green-600" /> Notre impact collectif
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ensemble, nous avons créé un mouvement éco local puissant. Chaque action compte et ensemble, nous transformons notre région. Merci d'être acteur du changement! 🌱
                </p>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 w-3/4" />
                </div>
              </Card>
            </TabsContent>

            {/* Événements */}
            <TabsContent value="events" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoin={handleJoinEvent}
                  />
                ))}
              </div>

              {events.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="text-muted-foreground">Pas d'événements pour le moment</p>
                  <p className="text-sm text-muted-foreground mt-2">Sois le premier à en créer un!</p>
                </div>
              )}
            </TabsContent>

            {/* Créer un événement */}
            <TabsContent value="create" className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                {createStep === 0 && (
                  <Card className="p-8 text-center space-y-4">
                    <div className="text-6xl">🌱</div>
                    <h3 className="text-2xl font-bold">Créer une action éco en 3 clics</h3>
                    <p className="text-muted-foreground">Mobilise ta communauté pour un événement écologique!</p>
                    <Button onClick={() => setCreateStep(1)} size="lg">
                      <Plus className="size-4 mr-2" /> Commencer
                    </Button>
                  </Card>
                )}

                {createStep === 1 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Étape 1: Titre de l'événement</h3>
                    <Input
                      placeholder="Ex: Nettoyage du parc..."
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="text-lg"
                    />
                    <Button onClick={() => setCreateStep(2)} disabled={!newEvent.title}>
                      Suivant →
                    </Button>
                  </Card>
                )}

                {createStep === 2 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Étape 2: Date et lieu</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Lieu</label>
                        <Input
                          placeholder="Ex: Parc Monceau, Paris"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCreateStep(1)}>
                        ← Précédent
                      </Button>
                      <Button onClick={() => setCreateStep(3)} disabled={!newEvent.date || !newEvent.location}>
                        Suivant →
                      </Button>
                    </div>
                  </Card>
                )}

                {createStep === 3 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Étape 3: Confirmer</h3>
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                      <p><strong>Titre:</strong> {newEvent.title}</p>
                      <p><strong>Date:</strong> {new Date(newEvent.date).toLocaleDateString("fr-FR")}</p>
                      <p><strong>Lieu:</strong> {newEvent.location}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Ton événement sera visible à tous et tu apparaîtras comme participant</p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCreateStep(2)}>
                        ← Précédent
                      </Button>
                      <Button onClick={createNewEvent}>
                        ✓ Créer l'événement
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
