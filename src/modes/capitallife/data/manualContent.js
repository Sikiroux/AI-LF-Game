// Contenu du manuel en jeu de Capital Life — remplace le PDF externe (qui ne
// s'ouvrait pas dans l'APK Android : les liens `target="_blank"` ne font
// rien dans une WebView Capacitor sans plugin dédié). Un écran interne est
// aussi plus facile à tenir à jour que d'exporter un PDF à chaque
// changement de règle.
export const MANUAL_SECTIONS = [
  {
    key: "objectif",
    label: "Objectif",
    title: "Le but du jeu",
    body: [
      { type: "p", text: "Capital Life simule une vie financière, mois par mois. Vous démarrez avec un métier, un salaire, quelques dettes et un peu de liquidités — l'objectif est d'atteindre l'indépendance financière : que vos revenus passifs (loyers, dividendes, cash-flow d'entreprises, actions) couvrent durablement vos dépenses, sans dépendre de votre salaire." },
      { type: "p", text: "La victoire n'est pas instantanée : il faut que votre cash-flow reste positif pendant 3 mois de paie consécutifs, avec une réserve de sécurité d'au moins 2 mois de dépenses en liquidités. Un seul mauvais mois remet le compteur à zéro — mieux vaut une indépendance solide qu'un pic ponctuel." },
      { type: "p", text: "À l'inverse, la défaite arrive si vous ne pouvez plus payer vos charges : le jeu tente d'abord de liquider des actifs, puis de vous accorder une ligne de crédit d'urgence à taux élevé ; si même ça ne suffit pas, c'est la faillite." },
    ],
  },
  {
    key: "journee",
    label: "Votre journée",
    title: "Comment le temps avance",
    body: [
      { type: "p", text: "Chaque jour, vous disposez d'un budget de Points d'Action (PA) — fixé par la difficulté choisie au lancement de la partie (Détente 15, Standard 10, Expert 8/jour) et verrouillé pour toute la partie. La plupart des actions de gestion (négocier un achat, former un employé, faire un entretien, postuler à un poste...) coûtent des PA. Naviguer entre les applications, elle, est toujours gratuite." },
      { type: "p", text: "Le bouton « Jour suivant » fait avancer d'un jour et régénère votre budget de PA. « 7 jours » et « Mois prochain » sautent plusieurs jours d'un coup — utile pour aller vite quand il n'y a rien à décider, mais un incident important sur un de vos actifs interrompt le saut en cours de route pour vous laisser choisir quoi faire." },
      { type: "p", text: "« Gestion prudente » (à activer dans le menu Options) réduit la fréquence des événements et résout automatiquement les incidents d'actifs avec l'option la plus sûre — pratique pour aller vite sans surveiller chaque détail, mais vous perdez la main sur les décisions." },
      { type: "p", text: "La fatigue est une jauge continue (pas un simple compteur de jours) : plus vous dépensez une grosse part de votre budget de PA jour après jour, plus elle monte ; elle redescend progressivement les jours plus calmes. Une fatigue trop élevée risque un burnout (arrêt de travail de 2 mois + frais médicaux) ou, si vous êtes en couple, un divorce coûteux." },
    ],
  },
  {
    key: "finances",
    label: "Finances",
    title: "📊 Finances",
    body: [
      { type: "p", text: "Vue d'ensemble de votre compte de résultat mensuel : salaire, revenus passifs, dépenses fixes (logement, transport, assurances...), mensualités de dettes. C'est l'écran à consulter pour comprendre pourquoi votre cash-flow est ce qu'il est." },
      { type: "p", text: "Le loyer/train de vie que vous choisissez dans Carrière influence directement vos dépenses fixes ici — et votre budget de PA quotidien (un logement plus modeste libère des PA, un logement plus confortable en coûte)." },
    ],
  },
  {
    key: "oppmarket",
    label: "OppMarket",
    title: "🏷️ OppMarket — le site d'opportunités",
    body: [
      { type: "p", text: "C'est ici que vous achetez de l'immobilier locatif, des parts ou la totalité d'entreprises, et des actions. OppMarket et la Bourse évoluent sur leur propre horloge toutes les 30 secondes, même lorsque vous consultez une autre application du jeu. Au retour après une absence, le marché rattrape le temps écoulé : certaines occasions peuvent avoir disparu, mais de nouvelles annonces sont toujours générées." },
      { type: "p", text: "Le cash-flow affiché sur une annonce est une estimation tant que vous ne l'avez pas inspectée (⚡1 PA) — environ 20% des biens/entreprises cachent un vice qui dégrade leur état dès l'achat, invisible sans inspection. Négocier (⚡2 PA) tente de faire baisser l'apport de 10 à 18%, avec une chance de succès liée à votre compétence Vente/Négociation ; en cas d'échec le vendeur peut se retirer de la table." },
      { type: "p", text: "Attention aux acheteurs concurrents : une annonce abordable ou exceptionnelle peut être raflée par quelqu'un d'autre avant sa date d'expiration affichée — ne laissez pas traîner une bonne affaire." },
      { type: "p", text: "À l'achat, vous choisissez entre payer comptant, financer avec intérêts seuls, ou ouvrir l'option avancée de prêt amortissable. L'apport minimal dépend du bien (20% en immobilier, 30% pour une entreprise) et la banque additionne toutes vos mensualités avant d'appliquer le plafond de 33% d'endettement." },
    ],
  },
  {
    key: "bourse",
    label: "Bourse",
    title: "📈 Bourse",
    body: [
      { type: "p", text: "Achetez et vendez des actions sur un marché qui évolue tout seul au fil des jours, par secteur (tech, énergie, biotech, crypto...). Chaque secteur a sa propre volatilité — la crypto bouge beaucoup plus qu'un titre du secteur énergie, par exemple." },
      { type: "p", text: "Le journal des traders (abonnement payant, résiliable) donne des indices sur les tendances à venir — souvent utiles, parfois trompeurs. Le journal des marchés (gratuit) retrace ce qui s'est passé." },
    ],
  },
  {
    key: "actifs",
    label: "Mes actifs",
    title: "📁 Mes actifs",
    body: [
      { type: "p", text: "Liste de tout ce que vous possédez avec un vrai cycle de vie : l'immobilier a un état (qui se dégrade avec le temps) et un locataire (fiabilité, satisfaction) ; les entreprises ont une réputation et, au-delà d'un certain seuil de participation, des employés à gérer (embaucher, former, licencier)." },
      { type: "p", text: "Entretien préventif : restaure l'état d'un actif contre paiement, avec un délai entre deux entretiens — pas un bouton à spammer. Rénovation : investissement plus lourd qui relève durablement la valeur et le revenu. Un bien vacant se choisit un nouveau locataire depuis sa fiche." },
      { type: "p", text: "La gestion automatique (sur une entreprise) délègue le pilotage contre environ 5% du cash-flow brut prélevé en frais — pratique si vous ne voulez pas micro-gérer, mais ça a un coût réel, pas un service gratuit." },
      { type: "p", text: "Vous pouvez ouvrir un second établissement sur une entreprise déjà solide, ou revendre un actif — le prix de vente dépend de sa santé et de la conjoncture du moment." },
    ],
  },
  {
    key: "dettes",
    label: "Mes dettes",
    title: "💳 Mes dettes",
    body: [
      { type: "p", text: "Regroupe vos dettes de départ (prêt étudiant, crédit auto, carte de crédit...) et les emprunts contractés pour vos achats. Vous pouvez rembourser une dette en un coup si vous avez les liquidités, ou passer un prêt en mensualités classiques (capital + intérêts, le solde baisse vraiment) au lieu d'intérêts seuls." },
      { type: "p", text: "L'écran permet aussi de demander un prêt personnel bancaire de 1 000 à 50 000, sur 24, 36 ou 60 mois, au taux annuel simplifié de 9%. La banque refuse si la nouvelle mensualité porte l'endettement total au-delà de 33%. Si vous cumulez au moins deux dettes de scénario ou d'imprévus, leur consolidation les regroupe avec 10% de frais." },
    ],
  },
  {
    key: "carriere",
    label: "Carrière",
    title: "💼 Carrière",
    body: [
      { type: "p", text: "Vos compétences se développent séparément par la formation ou la pratique. Elles ne remplacent toutefois plus un diplôme : les métiers réglementés exigent un cursus dédié. Devenir médecin demande notamment 730 jours de jeu, 90 000 de frais d'inscription et 3 PA par jour, en plus de seuils élevés en santé, analyse, communication et organisation." },
      { type: "p", text: "Changer de poste demande de remplir les seuils de compétences requis ET de réussir la candidature — être tout juste qualifié ne suffit pas, être largement au-dessus des seuils augmente vos chances. Une candidature refusée impose un délai avant de réessayer." },
      { type: "p", text: "Le train de vie (logement) que vous choisissez ici modifie votre budget de PA quotidien et vos dépenses fixes — un vrai arbitrage confort contre marge de manœuvre." },
    ],
  },
  {
    key: "casino",
    label: "Casino",
    title: "🎰 Casino",
    body: [
      { type: "p", text: "Un blackjack simplifié, pour le risque et le frisson — pas une stratégie d'enrichissement. L'avantage de la maison joue contre vous sur la durée : à utiliser avec de l'argent que vous êtes prêt à perdre, pas votre capital d'investissement." },
    ],
  },
  {
    key: "previsions",
    label: "Prévisions",
    title: "🔮 Prévisions",
    body: [
      { type: "p", text: "Tableau de bord qui projette votre situation : jours avant la prochaine paie et solde attendu, réserve de sécurité en mois de dépenses couverts, taux d'endettement, patrimoine net estimé, et les actifs qui redeviendront bientôt éligibles à un entretien. À consulter avant toute grosse décision pour ne pas se mettre en danger." },
    ],
  },
  {
    key: "strategie",
    label: "Bien jouer",
    title: "Conseils pour bien jouer",
    body: [
      { type: "li", items: [
        "Gardez toujours une réserve de liquidités — la banque refuse un prêt au-delà de 33% d'endettement, et un imprévu sans réserve force une liquidation d'actifs à un mauvais moment.",
        "Inspectez avant d'acheter quand vous avez le PA disponible : un vice caché non détecté dégrade l'état de l'actif dès le premier jour.",
        "Diversifiez entre immobilier (revenu stable, entretien régulier), entreprises (revenu plus élevé mais dépend du personnel) et actions (liquide, mais volatile) — ne misez pas tout sur un seul type d'actif.",
        "Surveillez votre fatigue : dépenser systématiquement tout votre budget de PA finit par coûter cher (burnout, divorce). Un jour plus calme de temps en temps n'est pas du temps perdu.",
        "La conjoncture économique tourne par cycles (expansion, croissance, inflation, ralentissement, récession, reprise) qui influencent les licenciements, le prix des missions, le taux des prêts et les bonnes affaires sur OppMarket — une récession est aussi le moment où les vendeurs pressés bradent leurs biens.",
        "La consolidation de dettes et la ligne de crédit d'urgence sont des filets de sécurité, pas des outils à utiliser par défaut — ils coûtent plus cher sur la durée qu'une gestion prudente.",
      ] },
    ],
  },
];
