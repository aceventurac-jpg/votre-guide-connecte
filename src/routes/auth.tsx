import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — SocialTown" },
      { name: "description", content: "Connecte-toi à SocialTown pour poser tes questions du quotidien." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("France");
  const [profileType, setProfileType] = useState("particulier");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, city, country, profile_type: profileType },
          },
        });
        if (error) throw error;
        toast.success("Compte créé !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/40">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold">SocialTown</h1>
          <p className="text-sm text-muted-foreground">Pose ta question, on s'occupe du reste.</p>
        </div>

        <div className="flex rounded-xl bg-muted p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                mode === m ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="name">Prénom</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Profil</Label>
                <Select value={profileType} onValueChange={setProfileType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="etudiant">Étudiant</SelectItem>
                    <SelectItem value="auto_entrepreneur">Auto-entrepreneur</SelectItem>
                    <SelectItem value="retraite">Retraité</SelectItem>
                    <SelectItem value="etranger">Étranger en France</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="aidant">Aidant</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Retour</Link>
      </Card>
    </div>
  );
}
