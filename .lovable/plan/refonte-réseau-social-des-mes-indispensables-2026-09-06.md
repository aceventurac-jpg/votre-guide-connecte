# Refonte "réseau social" des Mes indispensables

Le chantier est très large : je le découpe en 4 envois livrables l'un après l'autre, chacun utilisable immédiatement.

## Envoi 1 — Les fondations (médias, likes, notifications, profils)

- Stockage de fichiers : un espace public pour les photos et les vidéos (limite 60 s pour les publications, 15 s pour les stories), avec envoi depuis la galerie **ou** la caméra du téléphone.
- Nouvelles données : `media` (rattachée aux publications), `notifications` (like, commentaire, message, nouvelle publication d'un membre suivi, événement proche), `follows` (abonnements).
- Badge de notifications en temps réel dans la barre de navigation, avec liste déroulante et marquage "lu".
- Profil public : photo, bio, ville, ses publications, ses annonces actives, sa note moyenne, nombre d'échanges, bouton **Suivre**.

## Envoi 2 — Le fil vertical et les interactions

- Remplacement de la grille de cartes par un fil vertical plein écran (une publication par écran, défilement fluide).
- Vidéos en lecture automatique sans son, son activable au tap.
- Colonne d'actions flottante à droite : like (animation cœur), commentaires en surimpression, partage (story / communauté / message direct), message direct à l'auteur.
- Double-tap sur la photo ou la vidéo pour aimer.

## Envoi 3 — Les univers dédiés

- **Troc vêtements** : galerie photo/vidéo, filtres taille / style / ville / état, badge Disponible ou Réservé, bouton "Proposer un échange" qui ouvre la messagerie.
- **Recettes** : photo ou vidéo en grand, ingrédients en défilement horizontal, "Ajouter à ma liste de courses" en un tap, commentaires avec photo.
- **Services à domicile** (nouveau) : fiche prestataire avec vidéo de présentation, disponibilités du jour, bouton Réserver vers la messagerie, avis notés.

## Envoi 4 — Événements et stories enrichies

- **Collecte de déchets** (nouvel indispensable) : fil d'événements locaux avec photo/vidéo du lieu, bouton "Je participe" avec compteur, création en 2 étapes, story créée automatiquement.
- **Stories enrichies** : vidéo 15 s, texte superposé, sondage à 2 choix, lien cliquable, musique de fond optionnelle.

## Détails techniques

- Nouvelles tables : `media`, `notifications`, `follows`, `waste_events` + `waste_event_participants`, `services` + `service_availability`, extension de `stories` (media_url, overlay_text, poll_a/poll_b, poll_votes, link_url, music_url) et de `listings` (size, style, condition, status).
- Notifications alimentées par des déclencheurs base de données puis diffusées en direct (Realtime) au navigateur.
- Lecture vidéo via IntersectionObserver, `muted` + `playsInline` pour l'autoplay mobile ; capture caméra via `<input capture>`.
- Messagerie directe : la table `messages` actuelle exige une annonce ; j'ajoute une conversation directe entre deux membres indépendante des annonces.

## Point à confirmer

La musique de fond des stories : je prévois seulement l'ajout d'un fichier audio par l'auteur (pas de catalogue musical sous licence).
