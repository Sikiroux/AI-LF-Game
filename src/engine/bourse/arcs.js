export const ARC_TEMPLATES = [
  { id: "invention-rappel", sectors: ["tech", "biotech"], delayRange: [4, 7],
    stages: [
      { title: (t) => `${t.name} dévoile une invention révolutionnaire`, detail: "Le marché s'enflamme pour ce nouveau produit.", effect: 0.15 },
      { title: (t) => `Rappel de masse chez ${t.name}`, detail: "Des défauts critiques forcent le retrait du produit vedette.", effect: -0.25, sectorEffect: { kind: "malus" } },
    ] },
  { id: "tension-conflit", sectors: ["mines", "energie", "transport"], delayRange: [5, 9],
    stages: [
      { title: (t) => `Tensions croissantes autour des activités de ${t.name}`, detail: "Incertitude sur l'approvisionnement.", effect: -0.05 },
      { title: (t) => `Conflit ouvert : ${t.name} touchée de plein fouet`, detail: "Les exportations s'effondrent, les prix s'envolent.", effect: 0.2, sectorEffect: { kind: "shortage" } },
    ] },
  { id: "scandale-blanchi", sectors: ["finance", "retail", "agro"], delayRange: [3, 6],
    stages: [
      { title: (t) => `Un scandale éclabousse ${t.name}`, detail: "Une enquête est ouverte.", effect: -0.1 },
      { title: (t) => `${t.name} blanchie par l'enquête`, detail: "L'action rebondit fortement.", effect: 0.15 },
    ] },
  { id: "faillite", sectors: ["tech", "crypto", "immobilier", "retail", "transport"], delayRange: [5, 10],
    stages: [
      { title: (t) => `${t.name} multiplie les difficultés financières`, detail: "Les créanciers commencent à s'inquiéter.", effect: -0.15 },
      { title: (t) => `${t.name} se déclare en faillite`, detail: "L'action s'effondre, les activités du secteur sont perturbées.", effect: -0.5, sectorEffect: { kind: "bankrupt" } },
    ] },
  { id: "rachat", sectors: ["tech", "biotech", "finance"], delayRange: [4, 8],
    stages: [
      { title: (t) => `Rumeur de rachat autour de ${t.name}`, detail: "Un acquéreur potentiel identifié.", effect: 0.1 },
      { title: (t) => `${t.name} rachetée, l'action bondit`, detail: "Une prime de rachat est versée aux actionnaires.", effect: 0.3, sectorEffect: { kind: "boom" } },
    ] },
];

export const GLOBAL_ECONOMY_NEWS = [
  { title: "Une banque centrale relève ses taux", detail: "Emprunter devient plus cher partout.", effect: -0.03, loanRateMult: 1.6 },
  { title: "Une banque centrale baisse ses taux", detail: "Emprunter coûte moins cher.", effect: 0.03, loanRateMult: 0.6 },
  { title: "Journée calme sur les marchés", detail: "Peu de mouvement aujourd'hui.", effect: 0.005, loanRateMult: 1 },
  { title: "Regain de confiance des investisseurs", detail: "Optimisme général sur la place.", effect: 0.02, loanRateMult: 1 },
];

// Titres "sentiment" du Journal des Traders (abonnement payant) — souvent
// justes (corrélés au score de solidité caché) mais parfois faux, pour
// garder une part d'incertitude même en étant abonné.
export const TRADER_SENTIMENTS_POSITIVE = [
  "Les gros portefeuilles accumulent {t} en silence",
  "Les analystes voient un potentiel de hausse sur {t}",
  "Les fonds institutionnels renforcent leur position sur {t}",
  "Le consensus des traders est optimiste sur {t}",
];
export const TRADER_SENTIMENTS_NEGATIVE = [
  "Les gros portefeuilles allègent discrètement {t}",
  "Les analystes s'inquiètent pour {t}",
  "Des rumeurs de dégradation circulent sur {t}",
  "Le consensus des traders est prudent sur {t}",
];
