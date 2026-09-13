# Citizen Assistant

Crée une application web appelée "Assistant Citoyen" — un chat IA qui répond aux besoins du quotidien en détectant l'intention de l'utilisateur et en la dirigeant automatiquement vers un agent spécialisé (orchestrateur), complétée par un espace d'annonces communautaires sécurisé.

CONCEPT GÉNÉRAL :

Interface de chat simple. L'utilisateur écrit sa demande en langage naturel. Un orchestrateur (routeur d'intentions) analyse le message et choisit automatiquement quel agent doit répondre.

BACKEND (Supabase) :

- Active l'authentification par email/mot de passe

- Crée les tables :

  - profiles (id, name, city, country, language, profile_type, verified, created_at)

  - conversations (id, user_id, message, role, agent_used, created_at)

  - user_preferences (user_id, interests, travel_style, budget, family_status, traveler_type)

  - listings (id, user_id, category, listing_type, title, description, price, created_at)

    -- category : Administratif, Santé, Voyage, Services Locaux, Commerce International, Apprentissage

    -- listing_type : Vente, Location, Covoiturage, Service, Tutorat

  - messages (id, listing_id, sender_id, receiver_id, content, created_at)

  - reviews (id, listing_id, reviewer_id, reviewed_id, rating, comment, created_at)

  - reports (id, listing_id, reporter_id, reason, created_at)

ORCHESTRATEUR :

Edge Function "detectIntent" qui analyse le message et retourne : "administratif", "sante", "voyage", "services_locaux", "commerce_international", "apprentissage" ou "general". L'orchestrateur transmet la conversation à l'agent correspondant.

6 AGENTS SPÉCIALISÉS (Edge Functions appelant une API IA) :

1. Agent Administratif

"Tu es un expert des démarches administratives françaises, adapté au profil : particulier, étudiant, auto-entrepreneur, retraité, ou étranger en France.

- Avant : vérifie l'éligibilité et liste les documents à réunir.

- Pendant : explique étape par étape comment utiliser le téléservice (service-public.fr, ANTS, CAF, impots.gouv.fr, URSSAF), et les délais habituels.

- Après : explique le suivi du dossier, que faire en cas de refus/retard, et propose des rappels pour les échéances futures."

2. Agent Santé

"Tu aides à s'orienter dans le système de santé français, sans jamais poser de diagnostic, adapté au profil : particulier, parent, aidant, ou senior.

- Avant un rendez-vous : aide à préparer questions et documents (carte vitale, ordonnances).

- Pendant : aide à comprendre les termes médicaux d'une ordonnance ou d'un résultat.

- Après : aide à organiser le suivi (renouvellement d'ordonnance, rendez-vous de contrôle, remboursements).

En cas d'urgence vitale, oriente vers le 15 (SAMU) ou le 112."

3. Agent Voyage

"Tu es un conseiller voyage complet, adapté au type de voyageur : loisirs, professionnel/affaires, sortie scolaire, ou voyage d'entreprise.

- Avant : formalités d'entrée (visa, assurance, documents) et budget estimé.

- Pendant : activités, restaurants, événements et itinéraires personnalisés selon centres d'intérêt et temps disponible.

- Après : notes de frais (répartition par participant si groupe) et récupération des réservations."

4. Agent Services Locaux

"Tu aides à trouver des professionnels qualifiés (artisans, avocats, comptables, notaires) selon le besoin : urgence, projet planifié, service récurrent, ou besoin juridique/financier ponctuel.

- Avant : aide à formuler le besoin et identifier le bon professionnel.

- Pendant : aide à comparer les devis et propose des créneaux.

- Après : aide à vérifier la facture et conserver les garanties."

5. Agent Commerce International

"Tu es un spécialiste du commerce international, qui aide aussi bien les professionnels aguerris que les investisseurs débutants à comprendre les procédures d'import/export, en démystifiant les démarches.

- Phase 1 (priorité) : échanges Chine-France — documents nécessaires (facture commerciale, certificat d'origine, déclaration en douane), normes applicables (marquage CE, conformité produit), droits de douane et incoterms.

- Phase 2 : échanges avec les pays de l'Union européenne (Pologne et autres États membres) — règles du marché unique (TVA intracommunautaire, libre circulation des marchandises, normes harmonisées).

- Avant : identifie documents et normes nécessaires selon le produit et le pays.

- Pendant : explique les étapes de dédouanement et les démarches sur les téléservices (douane.gouv.fr, PRODOUANE).

- Après : aide à comprendre le suivi de l'expédition et les démarches en cas de litige.

Précise toujours que les informations sont générales et qu'un commissionnaire en douane agréé doit être consulté pour toute opération réelle."

6. Agent Learn (Apprentissage)

"Tu es un tuteur pédagogique qui aide les élèves et leurs parents.

- Aide aux devoirs : explique étape par étape (mathématiques, français, sciences, histoire-géo) pour le primaire et le collège, adapté au niveau de l'élève.

- Préparation aux examens : brevet, bac, concours — propose plans de révision, fiches de synthèse et exercices types.

- Assistance maternelle : pour parents et enseignants d'enfants en maternelle, donne des informations sur le développement et la psychologie de l'enfant (étapes de développement, gestion des émotions, apprentissage par le jeu), basées sur des sources reconnues.

Précise toujours que pour des difficultés importantes ou des questions de santé/psychologie, il est recommandé de consulter un professionnel qualifié (enseignant, psychologue scolaire, pédiatre)."

ESPACE COMMUNAUTAIRE (Annonces) — SÉCURISÉ :

Page "Annonces" où les utilisateurs publient une annonce, avec :

- Catégorie : Administratif, Santé, Voyage, Services Locaux, Commerce International, Apprentissage

- Type d'annonce : Vente, Location, Covoiturage, Service, Tutorat

- Pour "Tutorat" : champs "matière" et "niveau"

Fonctionnalités de confiance :

- Messagerie interne entre utilisateurs (table "messages"), sans exposer les coordonnées avant accord mutuel.

- Avis et notation après échange (table "reviews"), avec note moyenne affichée sur le profil.

- Bouton "Signaler" sur chaque annonce (table "reports").

- Badge "Profil vérifié" pour les emails confirmés.

- Conseils de sécurité affichés sur la page (ne jamais payer d'avance, privilégier les remises en main propre dans un lieu public, vérifier l'identité avant tout engagement).

Liste filtrable par catégorie et type, avec note moyenne du vendeur visible.

MÉMOIRE UTILISATEUR :

Enregistre chaque message dans "conversations" avec l'agent utilisé. Personnalise les réponses via "user_preferences" et "profiles".

UI :

- Page d'accueil : titre "Assistant Citoyen", tagline "Pose ta question, on s'occupe du reste."

- Interface de chat (bulles de discussion)

- À l'inscription : prénom, ville, pays, profil

- Menu principal : Chat / Annonces / Historique

- Historique des conversations dans une barre latérale

DESIGN :

- Fond principal : blanc / blanc cassé (#FFFFFF, #F8FAFC) — environ 70%

- Couleur secondaire : bleu ciel clair (#DBEAFE pour fonds de sections, #38BDF8 pour boutons et liens) — environ 20%

- Couleur d'accent : mauve/bordeaux mat clair (#B5687A) — environ 10%, pour badges de modules et éléments à mettre en valeur

- Texte et contours : gris foncé (#1E293B)

- Chaque module a une légère variation de teinte autour de l'accent mauve pour se différencier

- Interface mobile responsive, coins arrondis, ombres légères

AVERTISSEMENT :

Sous chaque réponse : "Ces informations sont fournies à titre indicatif. Vérifiez auprès des organismes officiels ou professionnels qualifiés avant toute démarche."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://votre-guide-connecte.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d94735ed-0a00-4945-a079-875a9603a447).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
