import { useState } from "react";
import { useCapitalLifeColors, getStyles, FONT_DISPLAY } from "../../styles/theme.js";
import { MANUAL_SECTIONS } from "../../data/manualContent.js";

export default function CapitalLifeManualScreen({ onBack }) {
  const C = useCapitalLifeColors();
  const styles = getStyles(C);
  const [sectionKey, setSectionKey] = useState(MANUAL_SECTIONS[0].key);
  const section = MANUAL_SECTIONS.find((s) => s.key === sectionKey) || MANUAL_SECTIONS[0];

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <button className="cl-tap" style={styles.backBtn} onClick={onBack}>←</button>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, color: C.ink }}>📖 Manuel</div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", padding: "0 16px", overflowX: "auto", background: C.surfaceRaised }}>
        <div style={{ ...styles.centerCol, ...styles.tabBar }}>
          {MANUAL_SECTIONS.map((s) => (
            <button
              className="cl-tap"
              key={s.key}
              style={{ ...styles.tab, ...(sectionKey === s.key ? styles.tabActive : {}) }}
              onClick={() => setSectionKey(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.content, padding: 16 }}>
        <div style={styles.card}>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{section.title}</div>
            {section.body.map((block, i) => {
              if (block.type === "p") {
                return <p key={i} style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, margin: i === 0 ? "0 0 12px" : "0 0 12px" }}>{block.text}</p>;
              }
              if (block.type === "li") {
                return (
                  <ul key={i} style={{ margin: 0, padding: "0 0 0 18px" }}>
                    {block.items.map((item, j) => (
                      <li key={j} style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
