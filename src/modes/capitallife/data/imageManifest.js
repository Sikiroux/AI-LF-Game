// Inventaire des visuels réellement fournis pour Capital Life — le reste du
// code référence des noms de fichiers "cibles" (icônes d'appli, photos
// d'annonces) qui n'existent pas tous encore ; ce fichier sert de source de
// vérité pour savoir lesquels afficher réellement, les autres retombant sur
// le repli emoji/placeholder existant plutôt que de casser sur un 404.
export const ICON_BASE = `${import.meta.env.BASE_URL}capitallife/icons/`;
export const LISTING_BASE = `${import.meta.env.BASE_URL}capitallife/listings/`;

export const AVAILABLE_ICONS = new Set([
  "icon-finances.png",
  "icon-oppmarket.png",
  "icon-bourse.png",
  "icon-actifs.png",
  "icon-dettes.png",
  "icon-carriere.png",
  "icon-casino.png",
]);

// Variantes disponibles par catégorie d'annonce (1 à N) — vide tant qu'aucune
// photo n'a été fournie pour cette catégorie.
export const AVAILABLE_LISTING_VARIANTS = {
  realestate: [1, 2],
  business: [],
  stock: [],
};
