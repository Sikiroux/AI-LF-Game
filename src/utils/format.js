import { CURRENCIES, RATES_FROM_EUR } from "../data/currencies.js";

export function fmt(n, currency) {
  const cfg = CURRENCIES[currency] || CURRENCIES.EUR;
  const rate = RATES_FROM_EUR[currency] || 1;
  const converted = n * rate;
  const sign = converted < 0 ? "-" : "";
  const abs = Math.abs(Math.round(converted));
  const numStr = abs.toLocaleString("fr-FR").replace(/[\u00a0\u202f]/g, " ");
  return cfg.position === "before" ? `${sign}${cfg.symbol}${numStr}` : `${sign}${numStr} ${cfg.symbol}`;
}
// Convertit un montant saisi par l'utilisateur dans sa devise actuelle vers la devise
// de base (euros) utilisée en interne pour tous les calculs du jeu.
export function toEUR(amount, currency) {
  const rate = RATES_FROM_EUR[currency] || 1;
  return (Number(amount) || 0) / rate;
}
export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function randNoRepeat(arr, lastRef) {
  if (arr.length <= 1) return arr[0];
  let pick, guard = 0;
  do {
    pick = arr[Math.floor(Math.random() * arr.length)];
    guard++;
  } while (pick === lastRef.current && guard < 8);
  lastRef.current = pick;
  return pick;
}
export const uid = () => Math.random().toString(36).slice(2, 10);
export const tilt = (i) => (((i * 53) % 9) - 4) * 0.6; // rotation "faite main" stable par case
