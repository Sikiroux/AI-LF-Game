# Capital Life — avis sur un système de survie financière

## Conclusion

La proposition externe va dans la bonne direction : elle transforme le calendrier en ressource et la dette en menace active. Elle ne doit toutefois pas remplacer Capital Life par un jeu d'angoisse arbitraire. Le meilleur résultat serait un mélange : une simulation financière lisible, avec des échéances réellement calculées et une pression provenant des conséquences économiques — jamais d'un moteur qui punit volontairement le joueur parce qu'il commence à réussir.

Capital Life possède déjà une grande partie des fondations :

- salaire et dépenses mensuels ;
- calendrier journalier et sauts temporels ;
- points d'action quotidiens ;
- dettes avec capital, mensualité et intérêts ;
- événements de vie et incidents d'actifs ;
- fatigue, burnout et perte d'emploi ;
- Bourse et OppMarket en temps réel ;
- formations longues et coûteuses ;
- premier défi limité à 24 mois.

Il ne faut donc pas recommencer le jeu. Il faut approfondir les interactions entre ces systèmes.

## Ce que je conserverais de la proposition

### 1. Le temps doit avoir un coût d'opportunité

Passer un jour doit signifier :

- une journée de moins avant l'échéance ;
- des intérêts courus ;
- des opportunités susceptibles d'expirer ;
- une progression éventuelle de formation ou de contrat ;
- des dépenses déjà engagées qui continuent de courir.

Le saut ne doit pas être une punition spéciale. Il doit exécuter exactement les mêmes règles que plusieurs journées normales, en supprimant seulement la possibilité d'agir entre ces journées.

### 2. La dette vivante

Cette partie est indispensable et vient d'être amorcée dans Capital Life. Chaque dette doit posséder :

- un capital restant ;
- un taux annuel ;
- une mensualité ;
- une part d'intérêts et une part de capital ;
- une date ou durée estimée de remboursement ;
- un coût total restant.

Rembourser une carte de crédit à 20 % doit être beaucoup plus urgent que rembourser un prêt étudiant à 4 %. Le jeu doit montrer cette différence afin que le joueur apprenne à prioriser ses dettes.

### 3. Les arbitrages quotidiens

Les PA doivent opposer des usages réellement différents :

- avancer un contrat freelance ;
- rechercher ou négocier un emploi ;
- suivre une formation ;
- inspecter une opportunité ;
- gérer un actif ;
- se reposer pour diminuer la fatigue.

Une action ne doit pas être un simple bouton transformant des PA en argent. Elle doit modifier un projet, un risque ou une information.

### 4. Les conséquences différées

Une panne ignorée peut réduire les PA pendant plusieurs jours. Une facture médicale reportée peut coûter davantage. Une mission mal livrée peut abîmer la réputation. Ces chaînes de conséquences sont plus intéressantes que des pertes d'argent instantanées et isolées.

## Ce que je changerais

### 1. Ne pas débiter artificiellement toutes les dépenses chaque jour

Le jeu fonctionne actuellement avec une comptabilité mensuelle. La remplacer entièrement par des retraits quotidiens rendrait les comptes plus difficiles à comprendre et risquerait de compter deux fois certaines charges.

Je recommande un système hybride :

- loyer, mensualités, abonnements et salaire restent prélevés ou versés à date fixe ;
- alimentation, transport, énergie et dépenses courantes s'accumulent quotidiennement dans un compteur ;
- le tableau de bord montre « dépenses courantes engagées ce mois-ci » ;
- au jour de paie, ces montants sont consolidés dans le bilan mensuel.

Le joueur voit ainsi le coût du temps sans perdre la lisibilité comptable.

### 2. Ne jamais déclencher un imprévu parce que le joueur a épargné

La phrase « plus le joueur accumule un matelas, plus le jeu doit le tester » créerait un système injuste. Le joueur comprendrait rapidement que l'épargne déclenche les catastrophes.

Les événements doivent dépendre de variables simulées :

- âge et état d'un véhicule ou d'un logement ;
- entretien reporté ;
- santé et fatigue ;
- composition du foyer ;
- saison ;
- cycle économique ;
- qualité et fiabilité des actifs.

Une réserve permet alors réellement d'absorber les risques au lieu d'attirer artificiellement les problèmes.

### 3. Éviter une interface agressive en permanence

Un compte à rebours rouge géant, des tremblements d'écran et des battements de cœur permanents fatigueraient rapidement le joueur et nuiraient à l'accessibilité.

La pression visuelle devrait rester progressive :

- état normal au début ;
- avertissement sous six mois ;
- échéance mise en avant sous trois mois ;
- état critique pendant le dernier mois ;
- animations désactivables et respect de `prefers-reduced-motion`.

La dette restante, la trajectoire et le nombre de mensualités possibles sont plus utiles qu'un effet anxiogène.

### 4. Les créanciers doivent produire des conséquences économiques

Les courriers et appels peuvent donner du contexte, mais ils ne doivent pas seulement gêner l'interface. Chaque étape doit correspondre à une règle :

- rappel : information sans pénalité ;
- retard : frais mesurés ;
- incident : hausse du taux ou baisse du score bancaire ;
- défaut prolongé : saisie ou restructuration ;
- négociation : échéancier alternatif contre coût total supérieur.

## Architecture recommandée

### Couche 1 — Calendrier

Le calendrier déclenche les échéances, intérêts, contrats, événements et marchés. Un saut appelle le même moteur qu'une succession de jours.

### Couche 2 — Budget du foyer

Le foyer possède des flux fixes, des dépenses courantes accumulées, une réserve et des risques prévisibles. Chaque mois produit un véritable relevé explicatif.

### Couche 3 — Dettes

Chaque dette suit son amortissement. Les stratégies avalanche, boule de neige, consolidation et report peuvent alors être comparées par le simulateur d'équilibrage.

### Couche 4 — Travail et contrats

Le salaire est stable mais limité. Les contrats freelance proposent davantage de contrôle avec une incertitude sur le devis, la charge, le délai, la qualité et le paiement.

### Couche 5 — Opportunités et investissement

OppMarket et la Bourse offrent des possibilités non garanties. L'information, l'inspection et le temps d'analyse réduisent le risque sans le supprimer.

### Couche 6 — Défis

Un défi définit uniquement la situation, la durée, les objectifs et certaines contraintes. Il réutilise les mêmes moteurs que Vie libre.

## Modifications prioritaires pour Capital Life

### Priorité 1 — Fiabiliser le premier défi

- vérifier visuellement les nouveaux écrans ;
- tester les sauvegardes et reprises de partie ;
- tester une réussite le jour exact de l'échéance ;
- empêcher un saut de dépasser silencieusement la limite ;
- enregistrer les raisons de réussite ou d'échec.

### Priorité 2 — Créer les dépenses courantes accumulées

- alimentation ;
- transport ;
- énergie et communications ;
- dépenses variables liées au foyer ;
- relevé mensuel détaillé.

Ces montants doivent varier dans des limites connues, pas être de simples pertes aléatoires.

### Priorité 3 — Transformer les missions en contrats

- budget proposé ;
- devis du joueur ;
- acompte ;
- charge en PA ;
- date limite ;
- qualité ;
- réputation ;
- délai et risque de paiement.

### Priorité 4 — Ajouter le repos comme décision

Le repos ne doit pas seulement signifier « ne pas dépenser ses PA ». Une action explicite peut accélérer la récupération, avec pour coût une journée ou une opportunité de revenu.

### Priorité 5 — Modéliser les retards de paiement

Avant d'ajouter des huissiers ou des animations, il faut gérer :

- paiement minimum ;
- retard ;
- pénalité ;
- renégociation ;
- défaut ;
- score bancaire.

## Ce que je ne ferais pas encore

- multiplier les mini-jeux sans lien avec une décision financière ;
- ajouter plusieurs jeux de casino avant d'équilibrer le cœur économique ;
- déclencher des catastrophes en fonction du montant épargné ;
- créer une jauge de stress séparée si la fatigue remplit déjà ce rôle ;
- ajouter de nombreux effets visuels anxiogènes ;
- simuler individuellement chaque achat alimentaire ou chaque client.

## Proposition finale

Le système externe est une bonne direction si nous le reformulons ainsi :

> Capital Life n'essaie pas de stresser artificiellement le joueur. Il lui donne une échéance, des informations incomplètes, des ressources limitées et des conséquences persistantes. La tension naît du fait que le temps continue, que chaque décision ferme d'autres possibilités et que les erreurs financières coûtent réellement plus cher plus tard.

Cette approche conserve le caractère ludique et accessible de Capital Life tout en lui donnant la profondeur d'une véritable simulation.
