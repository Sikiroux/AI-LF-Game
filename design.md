# Système visuel — Liberté Financière

Ce document verrouille la direction validée avant la migration des écrans. Les deux modes partagent une même discipline d’interface, mais conservent des identités nettement différentes.

## Principes communs

- Concevoir d’abord pour 320, 375 et 414 px, puis étendre jusqu’à 768 px et au bureau.
- Une action principale par écran ; les actions secondaires restent visuellement calmes.
- Montrer le coût, le gain mensuel, la durée et le risque avant une décision financière.
- Conserver des libellés courts sur une seule ligne pour les boutons et onglets.
- Utiliser des chiffres tabulaires pour l’argent, les jours, les pourcentages et les points d’action.
- Laisser défiler les listes longues ; aucune carte ne doit être coupée pour faire tenir artificiellement l’écran.
- Suspendre la progression lorsqu’une décision obligatoire est affichée.
- Respecter `prefers-reduced-motion` et fournir un focus clavier visible.

## Capital Life

### Voix

Application financière ludique, directe et crédible. Elle doit ressembler à un petit système d’exploitation de gestion personnelle, pas à une feuille comptable ni à une application bancaire froide.

### Typographie

- Titres et actions : Fredoka, graisse 600–700.
- Texte courant : système sans-serif, graisse 400–600.
- Données financières : police monospace système avec chiffres tabulaires.
- Aucun titre italique.

### Couleurs claires

- Fond : `#F6EFE5`
- Surface principale : `#FFFBF6`
- Surface relevée : `#EFE5D8`
- Texte : `#171C24`
- Texte secondaire : `#6C645D`
- Accent corail : `#F36B3B`
- Accent pressé : `#D95028`
- Positif : `#079D5B`
- Négatif : `#D84145`
- Avertissement : `#C9820A`

### Couleurs sombres

- Fond : `#0C1422`
- Surface principale : `#182334`
- Surface relevée : `#243146`
- Texte : `#F8F2EA`
- Texte secondaire : `#99A8BE`
- Accent corail : `#FF7B4C`
- Positif : `#36D58A`
- Négatif : `#FF7075`
- Avertissement : `#F2B24C`

### Formes et profondeur

- Cartes : rayon 16–20 px, bord discret, ombre courte et chaude en clair.
- Boutons : rayon 12–16 px ; les boutons principaux utilisent le corail plein.
- Onglets : bande horizontale avec soulignement actif, jamais une pile de pilules.
- Icônes d’applications : carrés arrondis colorés, étiquette courte dessous.
- Les modales bloquantes utilisent un voile assombri et une carte centrale unique.

## Mode classique

### Voix

Carnet de route financier, chaleureux et matériel. Le joueur tamponne sa progression dans un dossier papier plutôt que de naviguer dans une application moderne.

### Typographie

- Titres : Fraunces, graisse 650–750, romain.
- Texte courant : sans-serif système.
- Données : monospace système.

### Palette

- Papier : `#F3E8D2`
- Carte : `#FFF9ED`
- Papier foncé : `#E8D8BB`
- Encre : `#17202A`
- Encre secondaire : `#5E6871`
- Terracotta : `#B94125`
- Moutarde : `#CD8E2A`
- Vert tampon : `#3F705E`

### Formes

- Filets fins et pointillés réservés aux séparations documentaires.
- Ombres décalées de 3–5 px sur les actions importantes.
- Cartes moins arrondies que Capital Life : 8–14 px.
- Le motif de lignes de carnet reste discret et ne doit jamais gêner la lecture.

## États interactifs

- Pression : déplacement ou réduction légère, 120 ms maximum.
- Survol : seulement sur les appareils disposant d’un pointeur précis.
- Désactivé : contraste réduit, curseur neutre, aucune ombre d’action.
- Chargement temporel : progression visible et texte expliquant ce qui avance.
- Décision obligatoire : temps du jeu suspendu jusqu’au choix du joueur.

## Structure des écrans

- Barre supérieure compacte : retour, titre, contexte utile.
- Résumé financier prioritaire au-dessus de la ligne de flottaison.
- Contenu principal défilable et centré, largeur lisible maximale de 560 px.
- Zone d’action fixe uniquement lorsqu’elle ne masque pas le contenu ; ajouter alors l’espace de fin nécessaire.
- Les écrans vides expliquent la prochaine action utile au lieu d’afficher seulement « aucun élément ».

## Validation

Chaque lot doit passer :

1. `npm run build`
2. contrôle visuel clair et sombre pour Capital Life
3. contrôle à 320, 375, 414 et 768 px
4. absence de défilement horizontal
5. boutons et onglets sur une seule ligne
6. parcours retour/menu fonctionnel
