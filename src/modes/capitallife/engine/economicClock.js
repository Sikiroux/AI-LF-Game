// Une même impulsion pilote les bougies et les annonces. Deux impulsions
// représentent une journée de calendrier, tandis qu'une impulsion arrive
// naturellement toutes les 30 secondes lorsque le joueur laisse vivre le jeu.
export const REALTIME_TICK_MS = 30000;
export const ECONOMY_TICKS_PER_GAME_DAY = 2;
export const MAX_REALTIME_CATCHUP_TICKS = 120;

