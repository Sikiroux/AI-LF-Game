export const CARD_SUITS = ["♠", "♥", "♦", "♣"];
export const CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const CHIP_VALUES = [10, 25, 50, 100, 250];

export function buildShoe(decks) {
  const shoe = [];
  for (let d = 0; d < decks; d++) for (const s of CARD_SUITS) for (const r of CARD_RANKS) shoe.push({ rank: r, suit: s });
  return shoe;
}
export function shuffleDeck(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function cardValue(rank) {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return parseInt(rank, 10);
}
export function handValue(cards) {
  let total = 0, aces = 0;
  cards.forEach((c) => {
    if (c.rank === "A") { aces++; total += 11; }
    else total += cardValue(c.rank);
  });
  let soft = aces > 0;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  if (aces === 0) soft = false;
  return { total, soft };
}
export function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards).total === 21;
}
