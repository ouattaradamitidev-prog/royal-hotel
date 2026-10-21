# Royal Hôtel — Côte d'Ivoire

Site vitrine et moteur de réservation d'un groupe hôtelier ivoirien : six
établissements à Abidjan, Assinie-Mafia, Grand-Bassam, Yamoussoukro et
San-Pédro. Entièrement en français, tarifs en francs CFA, réalisé en **HTML,
CSS et JavaScript vanilla** — aucun framework, aucune étape de build.

Conception & développement : [Damiti Ouattara](https://damiti-ouattara.vercel.app/)

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : héros avec moteur de recherche, adresses, réservation en 3 étapes, chambres, destinations partenaires, hébergements les mieux notés, services, chiffres clés, avis, journal, offre Royal Club |
| `hotels.html` | Les 6 établissements, filtrables par ville, budget et catégorie, avec tri et carte |
| `hotel.html` | Fiche établissement : galerie, présentation, équipements, hébergements, **devis en direct**, avis, infos pratiques, plan |
| `chambres.html` | 6 catégories d'hébergement (28 à 150 m²), filtrables par type, budget et capacité |
| `reservation.html` | Tunnel de réservation : séjour + coordonnées, récapitulatif chiffré en temps réel |
| `services.html` | Services inclus, quatre expériences (gastronomie, spa, séminaires, excursions) et galerie |
| `a-propos.html` | Histoire du groupe, chiffres, valeurs, direction, frise 2011 → 2026, engagements |
| `blog.html` | Le journal : article à la une, 6 articles, colonne latérale, pagination |
| `article.html` | Article complet : sommaire, citation, encarts, auteur, commentaires, articles liés |
| `contact.html` | Coordonnées des trois services, formulaire validé, horaires, carte, FAQ |

## Fonctionnalités

- **Barre de navigation fixe** sur toutes les pages : transparente au-dessus du
  visuel, fond sombre translucide dès le défilement, menu déroulant sous 786 px.
- **Moteur de recherche du héros** : destination, dates et voyageurs sont
  mémorisés puis pré-appliqués aux filtres de la page « Nos hôtels ».
- **Devis en temps réel** (fiche établissement et réservation) : nombre de nuits,
  hébergement, taxe de séjour (1 500 FCFA / nuit / voyageur), frais de service
  (5 %) et total, formatés en FCFA via `Intl.NumberFormat("fr-FR")`.
- **Cohérence des dates** : la date de départ se recale automatiquement dès
  qu'elle devient antérieure ou égale à la date d'arrivée.
- **Filtres instantanés** sur les hôtels (ville, budget, catégorie) et les
  chambres (type, budget, capacité), avec tri, réinitialisation et état
  « aucun résultat ».
- **Validation des formulaires** côté client (réservation, contact,
  commentaires, newsletter) : e-mail, téléphone, champs requis, messages
  d'erreur et de confirmation.
- Accordéons FAQ, galerie à vignettes, compteurs animés, notifications *toast*,
  bouton de retour en haut, bouton WhatsApp flottant.
- Responsive à trois paliers : 540 px, 786 px et 1024 px.

## Adaptation à la Côte d'Ivoire

- Villes, quartiers et repères réels : Le Plateau, Cocody, Assinie-Mafia,
  Grand-Bassam (classé UNESCO), Yamoussoukro, San-Pédro, lagune Ébrié, aéroport
  Félix-Houphouët-Boigny.
- Tarifs en **francs CFA**, indicatif téléphonique **+225**, domaine `.ci`.
- Moyens de paiement locaux mentionnés : Wave, Orange Money, MTN MoMo.
- Références culinaires et artisanales : kedjenou, attiéké de Dabou, alloco,
  sauce graine, tissus de Korhogo, beurre de karité.

## Note sur les images

Les fichiers `assets/steps-1.jpg`, `steps-2.jpg` et `steps-3.jpg` du modèle
d'origine contiennent du texte incrusté en anglais et des prix en dollars
(« Tokyo / Bali / Singapore », « $220/night »). Ils sont donc **inutilisés** :
la section « Réservez en trois étapes » s'appuie désormais sur des icônes, dans
le même langage visuel. Remplacez-les par vos propres illustrations si vous
souhaitez revenir à des visuels photographiques.

De même, `trip-2.jpg` (Rio de Janeiro) et `trip-4.jpg` (Barcelone) sont des
lieux identifiables : ils servent uniquement dans le carrousel des destinations
partenaires à l'international, correctement légendés.

## Structure

```
.
├── index.html          ├── services.html
├── hotels.html         ├── a-propos.html
├── hotel.html          ├── blog.html
├── chambres.html       ├── article.html
├── reservation.html    └── contact.html
├── styles.css          # feuille de styles unique (variables + 26 sections)
├── main.js             # scripts de l'interface
└── assets/             # images
```

## Dépendances (via CDN)

- [Remix Icon](https://remixicon.com/) — jeu d'icônes
- [ScrollReveal](https://scrollrevealjs.org/) — animations d'apparition
- Google Fonts — *Lato* (texte) et *Playfair Display* (titres)
- OpenStreetMap — cartes intégrées (aucune clé d'API requise)

## Lancer le projet

Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier pour un
rendu identique à la production :

```bash
python -m http.server 5177
```

## Déploiement

Site statique : le dossier se déploie tel quel, sans configuration.

```bash
npx vercel --prod
```
