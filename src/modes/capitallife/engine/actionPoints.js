// Budget quotidien de Points d'Action (PA) — limite les actions de gestion
// (embaucher/former/licencier/entretenir/négocier un achat/postuler/se
// former), jamais la navigation libre entre applis (OppMarket, Finances,
// Bourse restent gratuites et illimitées). Se recharge à chaque avancée du
// temps (jour suivant ou saut de mois), quel que soit le nombre de jours
// sautés. Réglable dans les Options — le surmenage (career.js) se mesure
// relativement à ce budget, jamais à un chiffre fixe.
export const DAILY_ACTION_POINTS_OPTIONS = [8, 10, 12, 15];
export const DAILY_ACTION_POINTS = 10;

export const ACTION_COSTS = {
  maintenance: 2,
  hire: 2,
  train: 3,
  fire: 1,
  buyAsset: 2,
};
