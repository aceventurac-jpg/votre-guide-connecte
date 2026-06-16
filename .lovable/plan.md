## Envoi 2 — UI Communauté, Accueil refondu, Filtre Contexte

Tout le backend est déjà en place (tables `posts`, `post_likes`, `post_comments`, colonne `context` sur `listings` et `posts`, server fns `community.functions.ts`, métadonnées `agent-meta.ts`, chat `preferred_agent`). Cet envoi rend tout ça visible et utilisable. **Aucune migration.**

### 1. Page Communauté `/community`
- Nouvelle route publique-friendly (mais création/like/commentaire = connecté)
- Fil de posts : titre, extrait, auteur, agent (badge couleur via `AGENT_META`), contexte (Loisirs/Pro), compteurs likes/comments
- Filtres en haut : `Tous | Administratif | Santé | Voyage | Services Locaux | Commerce International | Apprentissage | Sport` + toggle `Loisirs / Pro / Tous`
- Tri : Récents / Populaires (likes desc)
- Bouton flottant "Publier" → dialog (titre, contenu, agent, contexte)
- Page détail post `/community/$id` : contenu complet + commentaires + like

### 2. Bouton "Partager avec la communauté" dans `/chat`
- Sous chaque réponse assistant dans `ChatMessage.tsx`
- Ouvre le même dialog "Publier" pré-rempli : titre = 1ʳᵉ ligne, contenu = résumé de la réponse, agent = agent détecté, contexte par défaut Loisirs

### 3. Navigation
- Ajouter "Communauté" dans `AppShell` (entre Chat et Annonces)

### 4. Page d'accueil `/` refondue
- Hero court + sous-titre
- Grille de 6 bulles cliquables (1 par univers via `AGENT_ORDER`)
  - Icône Lucide depuis `AGENT_META`
  - Couleur d'accent propre (oklch déjà définie dans `AGENT_META`)
  - Animation d'entrée stagger (Tailwind `animate-in fade-in slide-in-from-bottom`, délai par index)
  - Clic → `/chat?agent=<key>`
- Section "Derniers échanges communauté" : 3 posts récents
- Section "Dernières annonces" : 3 annonces récentes
- Server fn `getHomePreview` → renvoie `{ posts: top3, listings: top3 }` en un appel (lecture publique via `supabaseAdmin` côté serveur — pas de PII)

### 5. Filtre Contexte (Loisirs / Pro)
- `/listings` : toggle `Tous / Loisirs / Professionnel` + champ Contexte dans le formulaire de création (déjà côté DB)
- `/community` : même toggle + champ dans le dialog de publication

### Fichiers
**Nouveaux :**
- `src/routes/community.tsx` (liste, publique)
- `src/routes/community.$id.tsx` (détail, publique ; actions = connecté)
- `src/components/CommunityPostCard.tsx`
- `src/components/PublishPostDialog.tsx`
- `src/components/UniverseBubble.tsx`
- `src/lib/home.functions.ts` (`getHomePreview`)

**Modifiés :**
- `src/routes/index.tsx` (refonte accueil)
- `src/components/AppShell.tsx` (entrée Communauté + bouton Publier)
- `src/components/ChatMessage.tsx` (bouton Partager)
- `src/routes/_authenticated/chat.tsx` (callback partage → dialog)
- `src/routes/_authenticated/listings.tsx` (toggle contexte + champ form)
- `src/lib/community.functions.ts` (ajouter filtres `category` et `context` si manquants ; lecture publique)
- `src/lib/listings.functions.ts` (filtre `context`)

### Notes
- Pas de mode invité dans cet envoi (point 7 = Envoi 3) : `/community` et son détail sont accessibles sans login en lecture, mais Like/Comment/Publier gardent le check session côté serveur fn. Sur la page, si non connecté → CTA inline "Connectez-vous pour participer", pas de redirect.
- L'accueil reste public.
- Animations légères (CSS Tailwind utility, pas de Framer Motion pour ne pas alourdir).

Je lance dès que tu valides.