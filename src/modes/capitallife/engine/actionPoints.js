// Budget quotidien de Points d'Action (PA) — limite les actions de gestion
// (embaucher/former/licencier/entretenir/négocier un achat/postuler/se
// former), jamais la navigation libre entre applis (OppMarket, Finances,
// Bourse restent gratuites et illimitées). Se recharge à chaque avancée du
// temps (jour suivant ou saut de mois), quel que soit le nombre de jours
// sautés. Le surmenage (career.js) se mesure relativement à ce budget,
// jamais à un chiffre fixe.
//
// Lié à la difficulté choisie au lancement de la partie plutôt que réglable
// librement en cours de route (15 PA sans contrepartie n'a aucune raison
// d'être moins bon que 8) — verrouillé une fois la partie commencée.
export const DIFFICULTY_PRESETS = {
  detente: { label: "Détente", dailyActionPoints: 15 },
  standard: { label: "Standard", dailyActionPoints: 10 },
  expert: { label: "Expert", dailyActionPoints: 8 },
};
export const DEFAULT_DIFFICULTY = "standard";
export const DAILY_ACTION_POINTS_OPTIONS = [8, 10, 12, 15];
export const DAILY_ACTION_POINTS = 10;

export const ACTION_COSTS = {
  maintenance: 2,
  hire: 2,
  train: 3,
  fire: 1,
  buyAsset: 2,
  ad: 2,
};
