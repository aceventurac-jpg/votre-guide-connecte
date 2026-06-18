## Contexte
Le crash `_authenticated/listings.tsx` était une référence Vite obsolète (le fichier vit désormais à `src/routes/listings.tsx`). Le routeTree est déjà correct, le redémarrage du dev server suffit. Aucune modification de routing nécessaire.

Le reste de la demande couvre 8 fonctionnalités. Pour rester maintenable, je propose **3 envois** consécutifs.

---

## Envoi 4 — UX + Recherche web réelle dans les agents

### A. Bouton "Accueil" toujours visible
- Ajouter dans `AppShell.tsx` un FAB rond (icône `Home`, bottom-right) toujours rendu, qui navigue vers `/`.
- Masqué sur la route `/` elle-même.

### B. Recherche web réelle dans les agents Santé / Voyage / Services Locaux / Commerce
- Activer le tool calling AI SDK dans `agents.server.ts` avec un outil `web_search` qui appelle Lovable AI Gateway en mode Google search grounding (`google/gemini-3-flash-preview` supporte `tools: [{ google_search: {} }]` via le gateway OpenAI-compatible — fallback : on appelle `websearch` côté serveur via fetch sur l'endpoint Lovable si disponible, sinon on demande au modèle de produire des requêtes et on injecte les résultats).
- Déclenchement automatique quand l'intention contient un lieu/pro/établissement (regex + détection par l'orchestrateur).
- Les prompts agents sont mis à jour pour exiger : nom réel, adresse, téléphone si trouvé, source en lien cliquable.

### C. Bouton "Ouvrir le site officiel"
- Dans `ChatMessage.tsx` (rendu assistant), parser la première URL d'un domaine officiel (`*.gouv.fr`, `service-public.fr`, `ameli.fr`, `urssaf.fr`, `impots.gouv.fr`, `ants.gouv.fr`, etc.) dans la réponse.
- Si trouvée, afficher un bouton primary "🔗 Ouvrir le site officiel" au-dessus du contenu markdown qui ouvre en `target="_blank" rel="noopener"`.

**Fichiers touchés** : `src/components/AppShell.tsx`, `src/components/ChatMessage.tsx`, `src/lib/agents.server.ts`, `src/lib/official-links.ts` (nouveau, liste de domaines).

---

## Envoi 5 — Entraide, Troc/Don, Animaux (extensions DB + UI)

### A. Migration unique
- `posts` : ajouter colonne `city text` (filtrage entraide locale) et étendre `category` pour accepter `entraide` et `animaux`.
- `listings` : étendre les catégories pour accepter `troc_don`, et types `scolaire`, `vetements`, `jouets`. Ajouter colonne `is_free boolean default false` (pour le don pur).
- Pas de nouvelle table, juste alter + check constraints relâchés.

### B. UI Communauté
- Dans `PublishPostDialog` et `community.tsx` filtres : ajouter catégories `Entraide locale` et `Animaux`.
- Champ ville (autocomplete simple `<input>`) sur les posts d'entraide.
- Filtre ville dans la barre de filtres.

### C. UI Annonces
- Dans `listings.tsx` form + filtres : ajouter type `Troc/Don`, catégories `Scolaire`, `Vêtements`, `Jouets`.
- Toggle "Gratuit (don)" qui set `is_free=true` et masque le prix.

**Fichiers touchés** : 1 migration, `src/lib/community.functions.ts`, `src/lib/listings.functions.ts`, `src/routes/community.tsx`, `src/routes/listings.tsx`, `src/components/PublishPostDialog.tsx`, `src/components/CommunityPostCard.tsx`.

---

## Envoi 6 — Recettes + Objectifs (2 nouvelles features perso)

### A. Migration
- Table `recipes` : `id uuid pk`, `user_id uuid → auth.users`, `title text`, `ingredients text[]`, `steps text[]`, `created_at`, `updated_at`. RLS : owner only.
- Table `goals` : `id uuid pk`, `user_id uuid → auth.users`, `title text`, `deadline date`, `status text check in ('en_cours','atteint','abandonne') default 'en_cours'`, `created_at`, `updated_at`. RLS : owner only.
- GRANTs aux roles `authenticated` + `service_role` (pas `anon`).

### B. Route `/recipes` (sous `_authenticated`)
- Liste, formulaire création (titre + textarea ingrédients ligne par ligne + textarea étapes).
- Bouton "Partager dans la communauté" qui ouvre `PublishPostDialog` pré-rempli (catégorie `apprentissage` ou nouvelle `cuisine`, à décider — je propose réutiliser `apprentissage` pour ne pas re-toucher l'enum).

### C. Route `/goals` (sous `_authenticated`)
- Liste + formulaire (titre + date deadline).
- Affichage en cards triées par deadline, badge couleur selon échéance (vert >7j, orange ≤7j, rouge dépassé).
- Bouton "Marquer atteint" / "Abandonner".
- Pas de rappels push (hors scope sans worker cron) — juste affichage du statut visuel et tri.

### D. Navigation
- Ajouter "Recettes" et "Objectifs" dans `AppShell` (section "Mon espace").

**Fichiers touchés** : 1 migration, `src/lib/recipes.functions.ts`, `src/lib/goals.functions.ts`, `src/routes/_authenticated/recipes.tsx`, `src/routes/_authenticated/goals.tsx`, `src/components/AppShell.tsx`.

---

## Points qui demandent une décision

1. **Recherche web réelle** : Lovable AI Gateway expose Gemini avec `tools: [{ google_search: {} }]` (grounding natif). Je l'utilise par défaut. Si ça échoue côté gateway, fallback : le modèle génère des suggestions de noms et l'utilisateur est invité à confirmer (sans inventer d'adresse).
2. **Recettes & objectifs** = accès connecté uniquement (pas de mode invité), c'est cohérent avec leur nature personnelle.
3. **Rappels d'objectifs** : visuels seulement dans cet envoi (badges couleur). Notifications email/push = chantier séparé qui demande pg_cron + intégration mail.

## Ordre proposé
J'enchaîne **Envoi 4** maintenant si tu valides, puis 5, puis 6. Dis-moi si tu veux ajuster l'ordre ou retirer/ajouter quelque chose.