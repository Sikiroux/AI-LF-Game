import { COLORS, styles } from "../../styles/theme.js";

export default function EventBanner({ event }) {
  const toneColor = event.tone === "good" ? COLORS.teal : event.tone === "bad" ? COLORS.rust : COLORS.navy;
  return (
    <div key={event.title + event.detail} className="banner-in" style={{ ...styles.banner, borderColor: toneColor }}>
      <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 13 }}>{event.title}</div>
      <div style={{ color: COLORS.inkSoft, fontSize: 12, marginTop: 2 }}>{event.detail}</div>
    </div>
  );
}
