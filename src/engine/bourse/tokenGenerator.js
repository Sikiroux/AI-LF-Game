import { SECTORS, SECTOR_VOLATILITY } from "../../data/sectors.js";
import { rand } from "../../utils/format.js";

export const NAME_PREFIXES = ["Nova","Aqua","Terra","Byte","Helio","Vertex","Lumen","Orbis","Ferro","Silva","Meridia","Kappa","Zenith","Ardent","Cobalt","Solstice","Auric","Nexon","Draco","Ombre","Cendra","Vireo","Talos","Marin","Ignis","Polaris","Argo","Faro"];
export const SECTOR_SUFFIX = {
  tech: ["Tech", "Systems", "Digital", "Labs"],
  energie: ["Energy", "Power", "Solar", "Fuels"],
  immobilier: ["Realty", "Properties", "Estates", "Habitat"],
  biotech: ["BioTech", "Genomics", "Pharma", "Health"],
  crypto: ["Chain", "Coin", "Ledger", "Protocol"],
  finance: ["Capital", "Finance", "Holdings", "Bank"],
  agro: ["AgroFoods", "Harvest", "Farms", "Grain"],
  transport: ["Logistics", "Transit", "Freight", "Motors"],
  mines: ["Mining", "Minerals", "Resources", "Ore"],
  retail: ["Retail", "Markets", "Goods", "Stores"],
};

export function makeCandle(prevClose, volatility, trendBias, extraEffect) {
  const open = prevClose;
  let price = open, high = open, low = open;
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const move = (Math.random() - 0.5) * 2 * (volatility / steps) + trendBias / steps + (extraEffect || 0) / steps;
    price = Math.max(0.5, price * (1 + move));
    high = Math.max(high, price);
    low = Math.min(low, price);
  }
  return { open, high, low, close: price };
}

export function generateTokens(count) {
  const usedNames = new Set();
  const usedTickers = new Set();
  const tokens = [];
  // Répartir les secteurs le plus uniformément possible sur "count" tokens
  const sectorPool = [];
  while (sectorPool.length < count) sectorPool.push(...SECTORS);
  const sectorsForTokens = sectorPool.slice(0, count).sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const sector = sectorsForTokens[i];
    let name, ticker, tries = 0;
    do {
      const prefix = rand(NAME_PREFIXES);
      const suffix = rand(SECTOR_SUFFIX[sector]);
      name = `${prefix} ${suffix}`;
      ticker = (prefix.slice(0, 2) + suffix.slice(0, 2)).toUpperCase();
      tries++;
    } while ((usedNames.has(name) || usedTickers.has(ticker)) && tries < 30);
    usedNames.add(name); usedTickers.add(ticker);

    const solidity = Math.round(20 + Math.random() * 70); // score caché 20-90
    const basePrice = Math.round(10 + Math.random() * 90);
    const volatility = SECTOR_VOLATILITY[sector] * (0.75 + Math.random() * 0.5);
    const trend = solidity > 55 ? (Math.random() < 0.6 ? "bull" : "flat") : (Math.random() < 0.5 ? "bear" : "flat");
    const trendBias = trend === "bull" ? volatility * 0.5 : trend === "bear" ? -volatility * 0.5 : 0;

    // Historique de départ : quelques jours simulés pour avoir un vrai graphique à lire dès l'ouverture
    let price = basePrice;
    const history = [];
    for (let d = 0; d < 15; d++) {
      const candle = makeCandle(price, volatility, trendBias, 0);
      history.push(candle);
      price = candle.close;
    }
    const lastCandle = history[history.length - 1];

    tokens.push({
      symbol: ticker, name, sector, volatility,
      price, history,
      lastChangePct: (lastCandle.close - lastCandle.open) / lastCandle.open,
      solidity, trend,
      trendTurnsLeft: 4 + Math.floor(Math.random() * 7),
    });
  }
  return tokens;
}
