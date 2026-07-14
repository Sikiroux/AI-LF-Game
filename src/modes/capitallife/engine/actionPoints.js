// Budget quotidien de Points d'Action (PA) — limite uniquement les actions de
// gestion (embaucher/former/licencier/entretenir/négocier un achat), jamais
// la navigation libre entre applis (OppMarket, Finances, Bourse restent
// gratuites et illimitées). Se recharge à chaque avancée du temps (jour
// suivant ou saut de mois), quel que soit le nombre de jours sautés.
export const DAILY_ACTION_POINTS = 10;

export const ACTION_COSTS = {
  maintenance: 2,
  hire: 2,
  train: 3,
  fire: 1,
  buyAsset: 2,
};
