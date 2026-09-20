import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, AlertTriangle, Wind, Droplets } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Météo Intelligente — Assistant Citoyen" },
      { name: "description", content: "Météo expliquée simplement avec alertes pluie" },
    ],
  }),
  component: WeatherPage,
});

const DEMO_WEATHER = {
  today: {
    temp: 22,
    condition: "Partiellement nuageux",
    humidity: 65,
    wind: 12,
    alert: false,
  },
  forecast: [
    { day: "Demain", emoji: "🌧", temp: "18°", alert: true, explanation: "Pluie toute la journée" },
    { day: "Lundi", emoji: "⛅", temp: "20°", alert: false, explanation: "Alternance soleil/nuages" },
    { day: "Mardi", emoji: "☀️", temp: "24°", alert: false, explanation: "Ensoleillé toute la journée" },
  ],
};

function WeatherPage() {
  const [city, setCity] = useState("Paris");

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-sky-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white inline-flex items-center justify-center">
              <Cloud className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Météo Intelligente</h1>
              <p className="text-sm text-muted-foreground">Expliquée simplement avec alertes</p>
            </div>
          </div>

          {/* Localisation */}
          <Card className="p-4 mb-6">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cherche ta ville..."
              className="w-full px-4 py-2 rounded border bg-background text-foreground"
            />
          </Card>

          {/* Alerte pluie */}
          {DEMO_WEATHER.today.alert && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">⚠️ Alerte pluie</p>
                  <p className="text-sm text-red-700">Prévois un parapluie pour demain</p>
                </div>
              </div>
            </Card>
          )}

          {/* Météo actuelle */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-sky-100 to-blue-100">
            <div className="text-center space-y-2">
              <div className="text-7xl">🌤</div>
              <p className="text-5xl font-bold text-foreground">{DEMO_WEATHER.today.temp}°</p>
              <p className="text-lg text-muted-foreground">{DEMO_WEATHER.today.condition} à {city}</p>
              <p className="text-sm text-muted-foreground">
                Ressenti 20° • Levé 06:45 • Couché 19:20
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <Droplets className="size-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-muted-foreground">Humidité</p>
                <p className="font-semibold">{DEMO_WEATHER.today.humidity}%</p>
              </div>
              <div className="text-center">
                <Wind className="size-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-muted-foreground">Vent</p>
                <p className="font-semibold">{DEMO_WEATHER.today.wind} km/h</p>
              </div>
              <div className="text-center">
                <CloudRain className="size-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-muted-foreground">Pluie</p>
                <p className="font-semibold">10%</p>
              </div>
            </div>
          </Card>

          {/* Prévisions */}
          <h3 className="font-semibold mb-3">Prévisions 7 jours</h3>
          <div className="space-y-2">
            {DEMO_WEATHER.forecast.map((day, idx) => (
              <Card key={idx} className={`p-4 flex items-center justify-between ${day.alert ? "bg-red-50 border-red-200" : ""}`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{day.emoji}</span>
                  <div>
                    <p className="font-semibold">{day.day}</p>
                    <p className="text-sm text-muted-foreground">{day.explanation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{day.temp}</p>
                  {day.alert && <p className="text-xs text-red-600">🌧 Alerte</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
