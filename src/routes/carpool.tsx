import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, MapPin, Users, MessageSquare, Plus, Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/carpool")({
  head: () => ({
    meta: [
      { title: "Covoiturage — Assistant Citoyen" },
      { name: "description", content: "Créer ou rejoindre un trajet, messagerie directe" },
    ],
  }),
  component: CarpoolPage,
});

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driver: string;
  seats: number;
  price: number;
  passengers: number;
}

const DEMO_TRIPS: Trip[] = [
  {
    id: "1",
    from: "Paris",
    to: "Lyon",
    date: "2026-09-15",
    time: "07:30",
    driver: "Marie",
    seats: 3,
    price: 35,
    passengers: 1,
  },
  {
    id: "2",
    from: "Paris",
    to: "Marseille",
    date: "2026-09-14",
    time: "15:00",
    driver: "Thomas",
    seats: 2,
    price: 55,
    passengers: 0,
  },
];

function CarpoolPage() {
  const [trips, setTrips] = useState<Trip[]>(DEMO_TRIPS);
  const [activeTab, setActiveTab] = useState("find");
  const [newTrip, setNewTrip] = useState({ from: "", to: "", date: "", time: "" });

  function createTrip() {
    if (newTrip.from && newTrip.to && newTrip.date) {
      const trip: Trip = {
        id: Date.now().toString(),
        ...newTrip,
        driver: "Toi",
        seats: 3,
        price: 0,
        passengers: 0,
      };
      setTrips([trip, ...trips]);
      setNewTrip({ from: "", to: "", date: "", time: "" });
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-indigo-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white inline-flex items-center justify-center">
              <Car className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Covoiturage</h1>
              <p className="text-sm text-muted-foreground">Partage tes trajets ou en trouve un</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="find">🔍 Trouver un trajet</TabsTrigger>
              <TabsTrigger value="create">➕ Créer un trajet</TabsTrigger>
            </TabsList>

            {/* Trouver un trajet */}
            <TabsContent value="find" className="space-y-4">
              <Card className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="D'où ?" className="text-sm" />
                  <Input placeholder="Vers où ?" className="text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input type="date" className="text-sm" />
                  <Button className="w-full">🔍 Chercher</Button>
                </div>
              </Card>

              <div className="space-y-3">
                {trips.map((trip) => (
                  <Card key={trip.id} className="p-4 hover:border-accent transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {trip.from} → {trip.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trip.date} à {trip.time}
                        </p>
                      </div>
                      <p className="font-bold text-lg">{trip.price}€</p>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="size-4" />
                        {trip.driver}
                      </span>
                      <span className="text-muted-foreground">
                        {trip.passengers}/{trip.seats} places
                      </span>
                    </div>

                    <Button className="w-full gap-2" variant="default">
                      <MessageSquare className="size-4" /> Rejoindre
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Créer un trajet */}
            <TabsContent value="create" className="space-y-4">
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Crée ton trajet</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="D'où ?"
                    value={newTrip.from}
                    onChange={(e) => setNewTrip({ ...newTrip, from: e.target.value })}
                  />
                  <Input
                    placeholder="Vers où ?"
                    value={newTrip.to}
                    onChange={(e) => setNewTrip({ ...newTrip, to: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={newTrip.date}
                      onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={newTrip.time}
                      onChange={(e) => setNewTrip({ ...newTrip, time: e.target.value })}
                    />
                  </div>
                  <Button onClick={createTrip} className="w-full gap-2" size="lg">
                    <Plus className="size-4" /> Créer le trajet
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-indigo-50 border-indigo-200">
                <p className="text-sm text-indigo-900">
                  ✓ Mensualité : partage ses trajets réguliers
                  <br />✓ Messagerie sécurisée avec les passagers
                  <br />✓ Notation et avis vérifiés
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
