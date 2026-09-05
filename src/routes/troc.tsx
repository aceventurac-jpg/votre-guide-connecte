import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gift, MapPin } from "lucide-react";
import { listListings } from "@/lib/listings.functions";

export const Route = createFileRoute("/troc")({
  head: () => ({
    meta: [
      { title: "Troc & Dons — Assistant Citoyen" },
      { name: "description", content: "Donne, échange et récupère gratuitement : vêtements, jouets, fournitures scolaires et matériel du quotidien." },
      { property: "og:title", content: "Troc & Dons — Assistant Citoyen" },
      { property: "og:description", content: "Donne, échange et récupère gratuitement près de chez toi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrocPage,
});

function TrocPage() {
  const listFn = useServerFn(listListings);
  const [city, setCity] = useState("");

  const { data } = useQuery({
    queryKey: ["troc"],
    queryFn: () => listFn({ data: { listing_type: "Troc/Don" as const } }),
  });

  const items = (data?.listings ?? []).filter((l) =>
    city.trim() ? (l.city ?? "").toLowerCase().includes(city.trim().toLowerCase()) : true,
  );

  return (
    <AppShell>
      <div className="max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
            <Gift className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Troc &amp; Dons</h1>
            <p className="text-sm text-muted-foreground">Vêtements, jouets, fournitures : ce qui ne te sert plus servira à quelqu'un.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Filtrer par ville" value={city} onChange={(e) => setCity(e.target.value)} />
          <Link to="/listings"><Button variant="outline">Déposer une annonce</Button></Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {items.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground sm:col-span-2">
              Rien à donner pour l'instant. Sois le premier à proposer quelque chose !
            </Card>
          )}
          {items.map((l) => (
            <Link key={l.id} to="/listings/$id" params={{ id: l.id }}>
              <Card className="p-4 hover:border-accent transition space-y-1 h-full">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{l.category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Gratuit</span>
                </div>
                <p className="font-medium line-clamp-1">{l.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                {l.city && <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3" />{l.city}</p>}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
