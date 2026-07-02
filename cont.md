# Contexte

Tu es un UX Designer senior, un Product Manager, un développeur Full Stack senior et un spécialiste de la conception d'applications web modernes.

Ta mission est de concevoir **un MVP (Minimum Viable Product)** d'une application web appelée **Planificateur de Lecture Biblique**.

L'objectif n'est pas simplement d'afficher un calendrier, mais de créer un véritable compagnon de lecture et de planification qui permettra à un groupe de suivre un défi de lecture biblique pendant plusieurs années sans jamais perdre sa progression.

L'application devra être suffisamment simple pour être développée rapidement, tout en ayant une architecture propre permettant d'ajouter facilement de nouvelles fonctionnalités dans le futur.

---

# Contexte du défi

Le défi fonctionne selon les règles suivantes :

* Le défi commence le **lundi 29 juin 2026**.
* Chaque semaine comporte :

  * Lundi : lecture
  * Mardi : lecture
  * Mercredi : lecture
  * Jeudi : lecture
  * Vendredi : lecture
  * Samedi : lecture
  * Dimanche : révision des six chapitres étudiés.
* On lit exactement **un chapitre par jour**.
* Le dimanche est toujours réservé au récapitulatif.
* Les semaines alternent entre :

  * Ancien Testament
  * Nouveau Testament
  * Ancien Testament
  * Nouveau Testament
  * etc.
* La progression est indépendante.
  Exemple :

  * semaine 1 : Genèse 1 à 6
  * semaine 2 : Matthieu 1 à 6
  * semaine 3 : Genèse 7 à 12
  * semaine 4 : Matthieu 7 à 12
* Lorsqu'un livre est terminé, l'application passe automatiquement au livre suivant.
* Cette logique doit fonctionner jusqu'à la fin de toute la Bible.

Aucun calcul manuel ne devra être nécessaire.

---

# Objectif principal

Permettre à l'utilisateur d'ouvrir l'application n'importe quel jour, même plusieurs années plus tard, et savoir immédiatement :

* quel chapitre lire aujourd'hui ;
* quel livre est en cours ;
* où il s'est arrêté ;
* quel sera le chapitre de demain ;
* quel sera le programme de la semaine prochaine ;
* ce qui a déjà été terminé ;
* quelle lecture ou quelle vidéo doit être publiée aujourd'hui, demain ou dans les jours à venir ;
* comment visualiser clairement la chronologie complète des lectures à venir.

L'utilisateur ne doit jamais avoir besoin de réfléchir.

L'application réfléchit pour lui.

---

# Interface

Créer une interface extrêmement moderne.

Simple.

Épurée.

Responsive.

Rapide.

Professionnelle.

Inspirée des meilleures interfaces actuelles.

L'expérience doit être fluide, visuelle et très lisible, avec une forte priorité donnée à la vue calendrier, qui doit être la pièce centrale de l'application.

---

# Page d'accueil

La page d'accueil doit afficher immédiatement :

Bonjour

Lecture du jour

La date du jour

Le type de semaine :

Ancien Testament

ou

Nouveau Testament

Le livre

Le chapitre

Un gros bouton

"Commencer la lecture"

Un bouton

"Marquer comme lu"

Un bouton

"Ajouter une note"

Une carte contenant

Lecture d'hier

Lecture de demain

La progression globale

Le pourcentage de progression

Le nombre de chapitres lus

Le nombre restant

Le nombre total de chapitres de la Bible

Une barre de progression animée

La page d'accueil doit aussi proposer un accès direct et visible à la vue calendrier, car c'est cette vue qui permet de comprendre rapidement la logique de la semaine, d'anticiper les lectures à venir et de suivre la cohérence globale du plan.

---

# Calendrier

Créer une vue calendrier **très large, très claire et très interactive**, qui soit au cœur de l'application.

Cette page doit permettre de visualiser d'un seul coup d'œil :

* les jours de la semaine ;
* les chapitres à lire ;
* les semaines à venir ;
* la chronologie complète des lectures ;
* les alternances Ancien Testament / Nouveau Testament ;
* les révisions du dimanche ;
* les contenus à publier ou à préparer à l'avance.

Le calendrier doit permettre à l'utilisateur de comprendre immédiatement :

* ce qui est prévu aujourd'hui ;
* ce qui sera lu demain ;
* ce qui sera lu dans une semaine ;
* ce qui sera lu dans plusieurs semaines ;
* quelle vidéo ou quel contenu doit être publié à telle date ;
* comment les lectures s'enchaînent sans rupture.

Chaque jour doit afficher :

* la date ;
* le livre ;
* le chapitre ;
* le statut :

  * À venir
  * Aujourd'hui
  * Lu
  * En retard
  * Révision

Chaque semaine doit être clairement identifiée :

* Semaine Ancien Testament
* Semaine Nouveau Testament

La vue calendrier doit proposer plusieurs niveaux de lecture :

* vue semaine ;
* vue mois ;
* vue planning étendu ;
* vue chronologique continue.

L'utilisateur doit pouvoir anticiper facilement sur plusieurs semaines, voire plusieurs mois, afin de savoir exactement quelle lecture ou quelle vidéo doit être publiée à chaque date.

Le calendrier doit être pensé comme un véritable outil de planification éditoriale et spirituelle, pas seulement comme une simple grille de dates.

---

# Filtres du calendrier

Le calendrier doit proposer des filtres puissants et simples à utiliser :

* filtre Ancien Testament ;
* filtre Nouveau Testament ;
* filtre Tous ;
* filtre par semaine ;
* filtre par mois ;
* filtre par statut ;
* filtre par livre ;
* filtre par chapitre ;
* filtre par révision du dimanche.

Lorsque l'utilisateur sélectionne **Ancien Testament**, le calendrier doit afficher uniquement les jours correspondant aux lectures de l'Ancien Testament.

Lorsque l'utilisateur sélectionne **Nouveau Testament**, le calendrier doit afficher uniquement les jours correspondant aux lectures du Nouveau Testament.

Le filtre doit être instantané, fluide et sans rechargement inutile.

---

# Partage de la vue calendrier

La page calendrier doit pouvoir être partagée via un lien.

Si l'utilisateur partage le lien de la page à quelqu'un, cette personne doit pouvoir voir la même vue calendrier, avec les mêmes filtres et la même période affichée.

Le lien partagé doit permettre :

* de conserver la vue active ;
* de conserver le filtre sélectionné ;
* de conserver la semaine ou la période affichée ;
* de consulter la même chronologie que l'utilisateur initial.

Cette fonctionnalité est essentielle pour l'organisation d'équipe, la préparation des vidéos et la coordination des publications.

---

# Historique

Créer une page Historique.

Elle doit permettre de consulter toutes les lectures passées.

Filtres :

* par année
* par mois
* par livre
* par testament
* par statut
* par type de jour :

  * lecture
  * révision
  * publication prévue
  * publication passée

L'historique doit aussi permettre de retrouver rapidement une date précise, une lecture précise ou une vidéo associée à une journée donnée.

---

# Progression

Créer une page Progression.

Elle affichera :

* Nombre de livres terminés
* Nombre de chapitres lus
* Progression Ancien Testament
* Progression Nouveau Testament
* Progression globale
* Pourcentages
* Barres de progression
* Statistiques

La progression doit être cohérente avec la vue calendrier afin que l'utilisateur puisse relier facilement l'avancement global à la chronologie des jours et des semaines.

---

# Notes

Chaque lecture doit permettre d'ajouter des notes.

Exemple :

* Ce que Dieu m'a enseigné
* Versets importants
* Prière
* Décision
* Applications personnelles

Les notes doivent être sauvegardées automatiquement.

Les notes doivent être accessibles depuis la page du jour, depuis le calendrier et depuis l'historique.

---

# Dimanche

Le dimanche ne doit jamais proposer un nouveau chapitre.

À la place :

* Récapitulatif automatique des six chapitres étudiés.
* Vue claire de la semaine écoulée.
* Possibilité d'ajouter un résumé personnel.
* Possibilité d'ajouter une note de synthèse.
* Possibilité de préparer le contenu ou la vidéo du dimanche.

Le dimanche doit être visuellement distinct dans le calendrier afin d'être immédiatement identifiable comme jour de révision.

---

# Recherche

Créer une recherche permettant de retrouver :

* un livre
* un chapitre
* une date
* une note
* une semaine précise
* une lecture à venir
* une lecture passée
* une publication prévue

La recherche doit être rapide, intuitive et utile pour naviguer dans un planning long et dense.

---

# Fonctionnement intelligent

L'application doit connaître toute la structure de la Bible.

* Ancien Testament
* Nouveau Testament
* Nombre de chapitres par livre
* Ordre des livres
* Passage automatique au livre suivant

Aucune intervention de l'utilisateur.

Le calendrier doit être généré automatiquement à partir de cette structure, afin de garantir une chronologie parfaite et continue.

---

# Sauvegarde

Pour le MVP :

* Utiliser LocalStorage.
* Aucune base de données.
* Aucune connexion.
* Toutes les données doivent être conservées localement.

Les filtres, la vue calendrier, les notes et les préférences d'affichage doivent être sauvegardés localement pour retrouver exactement la même expérience à chaque ouverture.

---

# Installation

L'application devra fonctionner immédiatement après :

npm install

npm run dev

Puis pouvoir être déployée sans modification sur Netlify ou Vercel.

---

# Technologies

* Next.js
* TypeScript
* Tailwind CSS
* Architecture propre
* Composants réutilisables
* Code documenté
* Responsive
* Mode sombre
* Mode clair
* PWA
* Offline

---

# Notifications

Prévoir la structure pour de futures notifications :

* Lecture du jour
* Rappel
* Dimanche : révision
* Lecture à venir
* Publication à préparer

---

# Design

Palette de couleurs chaleureuse et élégante.

Animations discrètes.

Transitions fluides.

Icônes modernes.

Cartes arrondies.

Très bonne lisibilité.

La vue calendrier doit être particulièrement soignée, avec une hiérarchie visuelle forte, des repères clairs et une navigation agréable entre les jours, les semaines et les périodes à venir.

---

# Architecture

Séparer correctement :

* Composants
* Hooks
* Utilitaires
* Types
* Données de la Bible
* Services
* Pages
* Layout

Le code devra être facilement maintenable.

L'architecture doit aussi permettre de faire évoluer la vue calendrier vers des fonctionnalités plus avancées comme la planification éditoriale, la synchronisation de groupe ou la gestion de contenus associés aux lectures.

---

# Évolutions futures

Prévoir dès maintenant l'architecture permettant d'ajouter plus tard :

* Connexion utilisateur
* Synchronisation cloud
* Partage entre groupes
* Défis de lecture
* Notifications push
* Lecture audio
* Statistiques avancées
* Versets favoris
* Export PDF
* Export Excel
* Multi-langues
* Application mobile
* Progression familiale
* Progression d'une église
* Commentaires
* Quiz bibliques
* Gamification
* Badges
* Récompenses
* Classement
* Mode administrateur
* Gestion de plusieurs plans de lecture
* Création de plans personnalisés
* Import/export des données
* API REST
* Base de données
* Authentification
* Gestion avancée des vues calendrier partagées
* Planification de publications vidéo
* Synchronisation des contenus à publier avec les lectures du calendrier

---

# Qualité attendue

Produire un MVP de qualité professionnelle.

Le code doit être propre, lisible, évolutif et documenté.

Chaque décision d'architecture doit être justifiée.

L'expérience utilisateur doit être simple, intuitive et agréable.

L'objectif est de disposer d'une application qui puisse évoluer progressivement vers une véritable plateforme complète de suivi de lecture biblique et de planification visuelle, tout en étant parfaitement utilisable dès le premier jour.
