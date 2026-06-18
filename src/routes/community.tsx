import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPosts } from "@/lib/community.functions";
import { POST_CATEGORY_META, POST_CATEGORY_ORDER, type PostCategoryKey } from "@/lib/agent-meta";
import { CommunityPostCard, type CommunityPost } from "@/components/CommunityPostCard";
import { PublishPostDialog } from "@/components/PublishPostDialog";
import { StoriesStrip } from "@/components/StoriesStrip";
import { useIsAuthed } from "@/hooks/use-auth";
import { Plus, Users } from "lucide-react";

const search = z.object({
  category: z.enum(POST_CATEGORY_ORDER as [PostCategoryKey, ...PostCategoryKey[]]).optional(),
  context: z.enum(["loisirs", "professionnel"]).optional(),
  city: z.string().optional(),
});

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Communauté — Assistant Citoyen" }] }),
  validateSearch: search,
  component: CommunityPage,
});

function CommunityPage() {
  const sp = useSearch({ from: "/community" });
  const navigate = useNavigate();
  const listFn = useServerFn(listPosts);
  const { authed } = useIsAuthed();
  const [open, setOpen] = useState(false);
  const [cityInput, setCityInput] = useState(sp.city ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", sp.category ?? "all", sp.context ?? "all", sp.city ?? "all"],
    queryFn: () => listFn({ data: { category: sp.category, context: sp.context, city: sp.city } }),
  });

  function setCat(c?: PostCategoryKey) {
    navigate({ to: "/community", search: (p: typeof sp) => ({ ...p, category: c }) });
  }
  function setCtx(c?: "loisirs" | "professionnel") {
    navigate({ to: "/community", search: (p: typeof sp) => ({ ...p, context: c }) });
  }
  function applyCity() {
    navigate({ to: "/community", search: (p: typeof sp) => ({ ...p, city: cityInput.trim() || undefined }) });
  }

  function publish() {
    if (!authed) { navigate({ to: "/auth" }); return; }
    setOpen(true);
  }

  const posts = (data?.posts ?? []) as CommunityPost[];

  return (
    <AppShell>
      <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="size-6 text-accent" /> Communauté
            </h1>
            <p className="text-sm text-muted-foreground">Questions, conseils, entraide et retours d'expérience.</p>
          </div>
          <Button onClick={publish}><Plus className="size-4 mr-1" /> Publier</Button>
        </div>

        <StoriesStrip category={sp.category === "entraide" || sp.category === "animaux" || sp.category === "cuisine" ? undefined : sp.category} />

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={!sp.category} onClick={() => setCat(undefined)} label="Toutes" />
            {POST_CATEGORY_ORDER.map((k) => (
              <FilterChip key={k} active={sp.category === k} onClick={() => setCat(k)} label={POST_CATEGORY_META[k].label} />
            ))}
          </div>
          <div className="flex gap-1.5 items-center flex-wrap">
            <FilterChip active={!sp.context} onClick={() => setCtx(undefined)} label="Tous contextes" />
            <FilterChip active={sp.context === "loisirs"} onClick={() => setCtx("loisirs")} label="Loisirs" />
            <FilterChip active={sp.context === "professionnel"} onClick={() => setCtx("professionnel")} label="Professionnel" />
            <form onSubmit={(e) => { e.preventDefault(); applyCity(); }} className="flex gap-1 ml-auto">
              <Input placeholder="Filtrer par ville" value={cityInput} onChange={(e) => setCityInput(e.target.value)} className="h-8 w-40 text-xs" />
              <Button type="submit" size="sm" variant="outline" className="h-8">OK</Button>
            </form>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
              <p>Pas encore de publication.</p>
              <Button variant="link" onClick={publish}>Sois le premier à publier</Button>
            </div>
          )}
          {posts.map((p) => <CommunityPostCard key={p.id} post={p} />)}
        </div>
      </div>

      <PublishPostDialog
        open={open}
        onOpenChange={setOpen}
        defaultCategory={sp.category}
        defaultContext={sp.context ?? "loisirs"}
      />
    </AppShell>
  );
}

function FilterChip({
  active, onClick, label,
}: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
        active ? "bg-accent text-accent-foreground border-accent" : "border-transparent bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
