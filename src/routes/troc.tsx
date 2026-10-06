import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, MapPin, MessageSquare, Filter, Plus, Image, Video } from "lucide-react";
import { listListings } from "@/lib/listings.functions";

export const Route = createFileRoute("/troc")({
  head: () => ({
    meta: [
      { title: "Troc & Dons — SocialTown" },
      { name: "description", content: "Donne, échange et récupère gratuitement : vêtements, jouets, fournitures scolaires et matériel du quotidien." },
      { property: "og:title", content: "Troc & Dons — SocialTown" },
      { property: "og:description", content: "Donne, échange et récupère gratuitement près de chez toi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrocPage,
});

interface TrocItem {
  id: string;
  title: string;
  description: string;
  category: string;
  city?: string | null;
  condition: "neuf" | "tres-bon" | "bon" | "acceptable";
  size?: string;
  style?: string;
  images: string[];
  type: "echange" | "don";
  author?: { name: string | null };
}

const DEMO_ITEMS: TrocItem[] = [
  {
    id: "1",
    title: "Robe été fleurie taille M",
    description: "Jolie robe d'été jamais portée, parfait pour l'été",
    category: "Vêtements",
    city: "Paris",
    condition: "neuf",
    size: "M",
    style: "Élégant",
    images: ["👗"],
    type: "echange",
    author: { name: "Marie" },
  },
  {
    id: "2",
    title: "Vélo enfant 20 pouces rouge",
    description: "Vélo en bon état, peu utilisé",
    category: "Jouets/Enfants",
    city: "Paris",
    condition: "tres-bon",
    images: ["🚲"],
    type: "don",
    author: { name: "Thomas" },
  },
  {
    id: "3",
    title: "Chandail laine gris taille L",
    description: "Chaud et confortable, bon état",
    category: "Vêtements",
    city: "Paris",
    condition: "bon",
    size: "L",
    style: "Casual",
    images: ["🧶"],
    type: "echange",
    author: { name: "Sophie" },
  },
];

const SIZES = ["Tous", "XS", "S", "M", "L", "XL", "XXL"];
const STYLES = ["Tous", "Casual", "Élégant", "Sport", "Vintage"];
const CONDITIONS = ["Tous", "Neuf", "Très bon", "Bon", "Acceptable"];

function TrocItemCard({ item, onContact }: { item: TrocItem; onContact: (item: TrocItem) => void }) {
  return (
    <Card className="overflow-hidden hover:border-accent transition group">
      {/* Image gallery */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl overflow-hidden">
        {item.images[0]}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {item.images.length > 0 && <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1"><Image className="size-3" /> {item.images.length}</div>}
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === "echange" ? "bg-blue-500/20 text-blue-700" : "bg-green-500/20 text-green-700"}`}>
            {item.type === "echange" ? "🔄 Échanger" : "🎁 Donner"}
          </span>
          <span className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-semibold">
            {item.condition === "neuf" ? "✨ Neuf" : item.condition === "tres-bon" ? "⭐ Très bon" : item.condition === "bon" ? "👍 Bon" : "🔧 Acceptable"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {item.size && <span className="bg-secondary px-2 py-1 rounded-full">{item.size}</span>}
          {item.style && <span className="bg-secondary px-2 py-1 rounded-full">{item.style}</span>}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
          <MapPin className="size-4" />
          <span className="font-medium">{item.city}</span>
          <span className="text-xs">par {item.author?.name || "Membre"}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onContact(item)}
            variant="default"
            size="sm"
            className="gap-1.5"
          >
            <MessageSquare className="size-4" /> Contacter
          </Button>
          <Button variant="outline" size="sm">
            ❤️ Sauvegarder
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TrocPage() {
  const listFn = useServerFn(listListings);
  const navigate = useNavigate();
  const [items, setItems] = useState<TrocItem[]>(DEMO_ITEMS);
  const [selectedSize, setSelectedSize] = useState("Tous");
  const [selectedStyle, setSelectedStyle] = useState("Tous");
  const [selectedCondition, setSelectedCondition] = useState("Tous");
  const [city, setCity] = useState("");
  const [contactItem, setContactItem] = useState<TrocItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["troc"],
    queryFn: () => listFn({ data: { listing_type: "Troc/Don" as const } }),
  });

  const filtered = items.filter((item) => {
    const matchCity = city.trim() ? (item.city ?? "").toLowerCase().includes(city.trim().toLowerCase()) : true;
    const matchSize = selectedSize === "Tous" || item.size === selectedSize;
    const matchStyle = selectedStyle === "Tous" || item.style === selectedStyle;
    const matchCondition = selectedCondition === "Tous" || item.condition === selectedCondition.toLowerCase().replace(" ", "-");
    const matchSearch = searchQuery.trim() ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchCity && matchSize && matchStyle && matchCondition && matchSearch;
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-6xl w-full mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground inline-flex items-center justify-center">
                <Gift className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Troc & Dons</h1>
                <p className="text-sm text-muted-foreground">Échange, donne ou trouve des vêtements et objets</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="size-4" /> Déposer une annonce
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Chercher une robe, un pantalon, des baskets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3 bg-card/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="size-4" /> Filtres
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Ville */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ville</label>
                <Input
                  placeholder="Paris, Lyon..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Taille */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Taille</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full h-8 px-2 rounded border bg-background text-sm"
                >
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Style */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full h-8 px-2 rounded border bg-background text-sm"
                >
                  {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* État */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">État</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full h-8 px-2 rounded border bg-background text-sm"
                >
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* Galerie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground md:col-span-2 lg:col-span-3">
                <div className="text-5xl mb-4">🔍</div>
                <p>Aucun article ne correspond à tes critères.</p>
                <p className="text-sm mt-2">Essaie de modifier tes filtres!</p>
              </Card>
            )}

            {filtered.map((item) => (
              <TrocItemCard
                key={item.id}
                item={item}
                onContact={setContactItem}
              />
            ))}
          </div>

          {/* Modal de contact */}
          {contactItem && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setContactItem(null)}
            >
              <Card className="max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-2">{contactItem.images[0]}</div>
                  <h2 className="text-xl font-semibold">{contactItem.title}</h2>
                  <p className="text-sm text-muted-foreground">{contactItem.city}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5 text-sm">
                  <p><strong>Vendeur:</strong> {contactItem.author?.name || "Membre"}</p>
                  {contactItem.size && <p><strong>Taille:</strong> {contactItem.size}</p>}
                  {contactItem.style && <p><strong>Style:</strong> {contactItem.style}</p>}
                  <p><strong>État:</strong> {contactItem.condition}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => {
                      // Naviguer vers messagerie
                      setContactItem(null);
                    }}
                  >
                    <MessageSquare className="size-4" /> Écrire
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setContactItem(null)}
                  >
                    Fermer
                  </Button>
                </div>

                <div className="text-xs text-center text-muted-foreground">
                  {contactItem.type === "echange" ? "🔄 Proposition d'échange" : "🎁 Article à donner"}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
