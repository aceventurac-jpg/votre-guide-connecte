import { createFileRoute, Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { APPS, useAppSettings, type AppSettings, type GlobalSettings } from "@/lib/app-settings";
import { Settings, Camera, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Réglages — SocialTown" },
      { name: "description", content: "Paramètre chaque application de SocialTown : caméra, notifications, confidentialité, localisation." },
      { property: "og:title", content: "Réglages — SocialTown" },
      { property: "og:description", content: "Paramétrage complet de toutes les applications SocialTown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const GLOBAL_ROWS: { key: keyof GlobalSettings; label: string; hint: string }[] = [
  { key: "autoCamera", label: "Caméra automatique", hint: "La caméra s'ouvre dès que tu entres dans l'appli (comme Snapchat)." },
  { key: "autoMic", label: "Micro automatique", hint: "Le son est enregistré avec tes vidéos." },
  { key: "frontCameraFirst", label: "Caméra selfie par défaut", hint: "Démarre sur la caméra avant." },
  { key: "autoLocation", label: "Localisation automatique", hint: "Ajoute ta ville à tes publications." },
  { key: "autoplayVideos", label: "Lecture auto des vidéos", hint: "Dans le fil vertical." },
  { key: "dataSaver", label: "Économie de données", hint: "Vidéos en qualité réduite." },
  { key: "hudNeon", label: "Interface néon OASIS", hint: "Effets lumineux du City Hub." },
];

const APP_ROWS: { key: keyof AppSettings; label: string }[] = [
  { key: "enabled", label: "Application activée" },
  { key: "notifications", label: "Notifications" },
  { key: "showOnHub", label: "Visible sur le City Hub" },
  { key: "shareToFeed", label: "Partager mes activités dans le fil" },
  { key: "useLocation", label: "Utiliser ma position" },
  { key: "privateMode", label: "Mode privé" },
];

function SettingsPage() {
  const s = useAppSettings();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="max-w-3xl mx-auto w-full p-4 md:p-6 space-y-6">
      <header className="flex items-center gap-3">
        <Settings className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Réglages</h1>
          <p className="text-sm text-muted-foreground">Paramètre SocialTown globalement, puis chaque application une à une.</p>
        </div>
      </header>

      <section className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Camera className="size-4" /> Appareil & publication</h2>
        {GLOBAL_ROWS.map((r) => (
          <label key={r.key} className="flex items-center justify-between gap-4 py-1">
            <span><span className="block text-sm font-medium">{r.label}</span><span className="block text-xs text-muted-foreground">{r.hint}</span></span>
            <Switch checked={s.global[r.key] as boolean} onCheckedChange={(v) => s.setGlobal({ [r.key]: v } as Partial<GlobalSettings>)} />
          </label>
        ))}
        <div className="flex items-center justify-between gap-4 py-1">
          <span className="text-sm font-medium">Visibilité par défaut des posts</span>
          <select className="rounded-md border bg-background px-2 py-1 text-sm" value={s.global.postVisibility}
            onChange={(e) => s.setGlobal({ postVisibility: e.target.value as GlobalSettings["postVisibility"] })}>
            <option value="public">Public</option><option value="abonnes">Abonnés</option><option value="prive">Privé</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">Ton navigateur demande l'autorisation une seule fois ; ensuite la caméra s'ouvre toute seule.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Applications ({APPS.length})</h2>
        {APPS.map((a) => {
          const cfg = s.app(a.id);
          const isOpen = open === a.id;
          return (
            <div key={a.id} className="rounded-xl border bg-card">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(isOpen ? null : a.id)}>
                <span className="font-medium">{a.label} {!cfg.enabled && <span className="text-xs text-muted-foreground">(désactivée)</span>}</span>
                <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t pt-3">
                  {APP_ROWS.map((r) => (
                    <label key={r.key} className="flex items-center justify-between text-sm">
                      {r.label}
                      <Switch checked={cfg[r.key]} onCheckedChange={(v) => s.setApp(a.id, { [r.key]: v })} />
                    </label>
                  ))}
                  <Link to={a.to as any} className="text-sm text-primary underline">Ouvrir {a.label}</Link>
                </div>
              )}
            </div>
          );
        })}
      </section>
      <Button variant="outline" onClick={s.reset}>Réinitialiser tous les réglages</Button>
    </div>
  );
}
