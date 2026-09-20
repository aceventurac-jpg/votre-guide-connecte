import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, Download, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Pro & Commerce — Assistant Citoyen" },
      { name: "description", content: "Catalogue, devis et factures PDF par IA" },
    ],
  }),
  component: BusinessPage,
});

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Service de consultation",
    price: 150,
    description: "1 heure de consultation professionnelle",
  },
  {
    id: "2",
    name: "Audit complet",
    price: 500,
    description: "Audit technique et recommandations",
  },
  {
    id: "3",
    name: "Formation en ligne",
    price: 99,
    description: "Accès 3 mois à la plateforme",
  },
];

function BusinessPage() {
  const [products] = useState<Product[]>(DEMO_PRODUCTS);
  const [activeTab, setActiveTab] = useState("catalog");
  const [cart, setCart] = useState<Product[]>([]);

  function addToCart(product: Product) {
    setCart([...cart, product]);
  }

  function generateInvoice() {
    const invoiceContent = `FACTURE #${Date.now()}\n\nDate: ${new Date().toLocaleDateString()}\n\n`;
    const items = cart.map((p) => `${p.name} - ${p.price}€`).join("\n");
    const total = cart.reduce((sum, p) => sum + p.price, 0);
    alert(`${invoiceContent}${items}\n\nTOTAL: ${total}€\n\nPDF généré par IA`);
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background to-cyan-50">
        <div className="max-w-4xl w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white inline-flex items-center justify-center">
              <Briefcase className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pro & Commerce</h1>
              <p className="text-sm text-muted-foreground">Catalogue, devis et factures par IA</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="catalog">🛍️ Catalogue</TabsTrigger>
              <TabsTrigger value="cart">🛒 Panier ({cart.length})</TabsTrigger>
              <TabsTrigger value="invoices">📄 Factures</TabsTrigger>
            </TabsList>

            {/* Catalogue */}
            <TabsContent value="catalog" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4 hover:border-accent transition">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg">{product.price}€</p>
                      <Button
                        onClick={() => addToCart(product)}
                        size="sm"
                        className="gap-1"
                      >
                        <ShoppingCart className="size-4" /> Ajouter
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Panier */}
            <TabsContent value="cart" className="space-y-4">
              {cart.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Panier vide</p>
                </Card>
              ) : (
                <>
                  <div className="space-y-2">
                    {cart.map((product, idx) => (
                      <Card key={idx} className="p-3 flex items-center justify-between">
                        <span>{product.name}</span>
                        <span className="font-bold">{product.price}€</span>
                      </Card>
                    ))}
                  </div>
                  <Card className="p-4 bg-secondary/50">
                    <p className="text-lg font-bold">
                      Total: {cart.reduce((sum, p) => sum + p.price, 0)}€
                    </p>
                  </Card>
                  <Button onClick={generateInvoice} className="w-full gap-2" size="lg">
                    <FileText className="size-4" /> Générer facture PDF
                  </Button>
                </>
              )}
            </TabsContent>

            {/* Factures */}
            <TabsContent value="invoices" className="space-y-4">
              <Card className="p-8 text-center text-muted-foreground">
                <FileText className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Pas encore de facture</p>
                <p className="text-xs mt-2">Tes factures générées apparaîtront ici</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
