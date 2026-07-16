import { useState } from "react";
import { styles, COLORS, CSS_EXTRA, FONT_DISPLAY } from "../../styles/theme.js";

const SECTIONS = [
  {
    title: "Le principe du jeu",
    body: [
      "Vous incarnez quelqu'un avec un métier, un salaire et des dépenses fixes chaque mois (impôts, prêts, enfants...). Au début, vos dépenses sont plus grandes que vos revenus passifs : vous êtes dans la « course infernale ».",
      "Le but : acheter des actifs qui rapportent de l'argent chaque mois (immobilier, actions, parts de business) jusqu'à ce que ce revenu passif dépasse vos dépenses. À ce moment-là, vous passez automatiquement en « Voie rapide ».",
    ],
  },
  {
    title: "La Course infernale",
    body: [
      "Un plateau de 24 cases. Vous lancez 1 dé et avancez case par case. Vous touchez votre Paie à chaque fois que vous passez sur la case Paie ou que vous tombez dessus.",
      "Types de cases : 💰 Paie (revenu), 📈 Opportunité (une affaire à saisir ou non), 📊 Marché (un événement qui peut changer la valeur ou le revenu de vos actifs), 🧾 Imprévu (une dépense à payer comptant ou à financer), 🤝 Don (donnez 10% de vos revenus pour lancer 2 dés pendant 3 tours), 👶 Bébé (+ de dépenses fixes, jusqu'à 3 enfants), 📉 Licencié (vous payez vos dépenses et passez 2 tours).",
    ],
  },
  {
    title: "La Voie rapide",
    body: [
      "Un plateau de 18 cases, avec 2 dés (ou 3 si vous faites un don). Vous y arrivez automatiquement dès que vos revenus passifs dépassent vos dépenses.",
      "Deux façons de gagner : acheter votre Rêve (choisi au tout début de la partie), ou faire grimper votre revenu voie rapide jusqu'à votre revenu de départ + 50 000.",
      "Cases spéciales : Cashflow Day (revenu), Business (une entreprise à acheter, augmente votre revenu), Rêve (achetez-le si vous avez assez de liquidités), Fisc et Procès (perdez 50% de vos liquidités), Don, Divorce (vous perdez toutes vos liquidités voie rapide).",
    ],
  },
  {
    title: "Acheter une opportunité",
    body: [
      "Sur une case Opportunité, une affaire vous est proposée (actions, immobilier ou business). Vous pouvez la payer comptant, ou l'acheter avec un apport + un emprunt.",
      "Par défaut, l'emprunt est à « intérêts seuls » : comme dans le vrai jeu, le solde ne diminue jamais tout seul. Pour vous en libérer, vous pouvez soit rembourser le solde entier d'un coup (depuis « Mes actifs »), soit activer des mensualités classiques (capital + intérêts) qui font baisser le solde à chaque paie.",
      "La banque refuse un emprunt si vos mensualités de dettes dépasseraient 33% de vos revenus (option désactivable dans les Options).",
    ],
  },
  {
    title: "La Bourse",
    body: [
      "Des actions (« tokens ») générées à chaque partie, réparties en secteurs (tech, énergie, immobilier...). Chaque action a son propre cours, qui évolue en chandeliers japonais.",
      "Le marché n'avance qu'au rythme des lancers de dé sur le plateau principal — pas de bouton pour le faire avancer librement.",
      "Le Journal des marchés retrace les événements (bonnes ou mauvaises nouvelles, faillites, rachats...). Le Journal des Traders est un abonnement payant qui donne des indices sur le sentiment du marché — souvent juste, parfois faux.",
      "Une commission de 0,75% s'applique à l'achat et à la vente.",
    ],
  },
  {
    title: "Le Casino",
    body: [
      "Une table de Blackjack simplifiée (pas de mise annexe, pas de partage de main). Le blackjack est payé 3:2. Vous choisissez votre mise avec des jetons ou un montant libre.",
    ],
  },
  {
    title: "Le prêt bancaire",
    body: [
      "En plus du financement des opportunités, vous pouvez emprunter directement auprès de la banque par tranches de 1000, à 10%/mois. Remboursable à tout moment par tranches, depuis le Bilan.",
      "Certaines cartes Imprévu peuvent aussi être financées automatiquement via ce même prêt bancaire plutôt que payées comptant.",
    ],
  },
  {
    title: "Les devises",
    body: [
      "Vous pouvez afficher tous les montants en euros, dollars, francs Pacifique ou francs CFA. Tous les calculs internes du jeu restent en euros — seul l'affichage change.",
    ],
  },
];

export default function RulesScreen({ onBack }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="screen-in" style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 480, marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>📖 Règles du jeu</div>
        <div style={{ width: 70 }} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 8 }}>
        {SECTIONS.map((section, i) => {
          const open = openIndex === i;
          return (
            <div key={section.title} style={styles.ledger}>
              <button
                className="btn-small"
                style={{ ...styles.smallBtn, width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: 0, textTransform: "none", letterSpacing: 0, cursor: "pointer" }}
                onClick={() => setOpenIndex(open ? -1 : i)}
              >
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: COLORS.ink, fontWeight: 700 }}>{section.title}</span>
                <span style={{ fontSize: 13, color: COLORS.inkSoft }}>{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="banner-in" style={{ marginTop: 10 }}>
                  {section.body.map((p, j) => (
                    <p key={j} style={{ fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.5, margin: j === 0 ? "0 0 8px" : "0 0 8px" }}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
