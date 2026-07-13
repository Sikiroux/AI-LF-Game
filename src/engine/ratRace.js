import { COLORS } from "../styles/theme.js";

export const SQUARE_STYLES = {
  payday: { accent: COLORS.mustard, label: "Paie", icon: "💰" },
  opportunity: { accent: COLORS.navy, label: "Opportunité", icon: "📈" },
  doodad: { accent: COLORS.rust, label: "Imprévu", icon: "🧾" },
  market: { accent: COLORS.teal, label: "Marché", icon: "📊" },
  charity: { accent: COLORS.plum, label: "Don", icon: "🤝" },
  baby: { accent: COLORS.rose, label: "Bébé", icon: "👶" },
  downsized: { accent: COLORS.charcoal, label: "Licencié", icon: "📉" },
};

export const RAT_RACE_SEQUENCE = [
  "payday","opportunity","doodad","opportunity","market","opportunity",
  "doodad","opportunity","payday","opportunity","charity","opportunity",
  "market","opportunity","doodad","opportunity","payday","opportunity",
  "baby","opportunity","market","opportunity","downsized","opportunity",
];
