import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, MessageSquare, Clock, Briefcase, Filter } from "lucide-react";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions à domicile — Assistant Citoyen" },
      { name: "description", content: "Trouve les services et prestataires près de chez toi avec avis vérifiés." },
    ],
  }),
  component: SolutionsPage,
});

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  price?: string;
  availability: string[];
  image?: string;
  phone?: string;
  city: string;
  verified: boolean;
}

const DEMO_SERVICES: Service[] = [
  {
    id: "1",
    name: "Bruno Plomberie",
    category: "Plomberie",
    description: "Dépannage urgent, tous types de fuites et installations",
    rating: 4.8,
    reviews: 127,
    price: "À partir de 60€",
    availability: ["Lundi-Vendredi 8h-18h", "Samedi 9h-12h"],
    image: "🔧",
    phone: "06 12 34 56 78",
    city: "Paris",
    verified: true,
  },
  {
    id: "2",
    name: "Nettoyage Express",
    category: "Ménage",
    description: "Ménage à domicile professionnel, qualité garantie",
    rating: 4.9,
    reviews: 89,
    price: "45€/heure",
    availability: ["Lundi-Samedi 7h-20h"],
    image: "🧹",
    phone: "06 87 65 43 21",
    city: "Paris",
    verified: true,
  },
  {
    id: "3",
    name: "Électricien Pro",
    category: "Électricité",
    description: "Rénovation, installation, diagnostic électrique",
    rating: 4.7,
    reviews: 156,
    price: "Devis gratuit",
    availability: ["Lundi-Vendredi 8h-17h"],
    image: "⚡",
    phone: "06 99 88 77 66",
    city: "Paris",
    verified: true,
  },
  {
    id: "4",
    name: "Jardinier Paysagiste",
    category: "Jardinage",
    description: "Entretien jardin, taille, paysagisme",
    rating: 4.6,
    reviews: 73,
    price: "À partir de 50€",
    availability: ["Lundi-Dimanche 9h-17h"],
    image: "🌱",
    phone: "06 11 22 33 44",
    city: "Paris",
    verified: true,
  },
];

const CATEGORIES = ["Tous", "Plomberie", "Électricité", "Ménage", "Jardinage", "Réparation"];

interface ServiceCardProps {
  service: Service;
  onContact: (service: Service) => void;
}

function ServiceCardComponent({ service, onContact }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:border-accent transition">
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl">
        {service.image}
        {service.verified && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            ✓ Vérifié
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{service.name}</h3>
          <p className="text-xs text-accent font-medium mb-1">{service.category}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Star className="size-4 fill-accent text-accent" />
          <span className="font-semibold">{service.rating}</span>
          <span className="text-muted-foreground">({service.reviews} avis)</span>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-3" />
            {service.city}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-3" />
            {service.availability[0]}
          </div>
          {service.price && (
            <div className="font-semibold text-foreground">
              {service.price}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onContact(service)}
            variant="default"
            size="sm"
            className="gap-1.5"
          >
            <MessageSquare className="size-3" /> Contacter
          </Button>
          {service.phone && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.location.href = `tel:${service.phone}`}
            >
              <Phone className="size-3" /> Appeler
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function SolutionsPage() {
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [contactService, setContactService] = useState<Service | null>(null);

  const filtered = services.filter((s) => selectedCategory === "Tous" || s.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl w-full mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground inline-flex items-center justify-center">
              <Briefcase className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Solutions à domicile</h1>
              <p className="text-sm text-muted-foreground">Trouve les meilleurs prestataires près de chez toi</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="size-4 text-muted-foreground" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "reviews")}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm"
              >
                <option value="rating">★ Note (décroissant)</option>
                <option value="reviews">Nombre d'avis</option>
              </select>
            </div>
          </div>

          {/* Liste des services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((service) => (
              <ServiceCardComponent
                key={service.id}
                service={service}
                onContact={setContactService}
              />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-muted-foreground">Pas de service trouvé dans cette catégorie</p>
            </div>
          )}

          {/* Modal de contact */}
          {contactService && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setContactService(null)}
            >
              <Card className="max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-2">{contactService.image}</div>
                  <h2 className="text-xl font-semibold">{contactService.name}</h2>
                  <p className="text-sm text-accent font-medium">{contactService.category}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 fill-accent text-accent" />
                    <span>{contactService.rating} ({contactService.reviews} avis)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{contactService.city}</span>
                  </div>
                  {contactService.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <a href={`tel:${contactService.phone}`} className="text-accent hover:underline">
                        {contactService.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => {
                      // Naviguer vers messagerie
                      setContactService(null);
                    }}
                  >
                    <MessageSquare className="size-4" /> Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setContactService(null)}
                  >
                    Fermer
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
