import { useState, useRef } from "react";
import { fmt } from "../../utils/format.js";
import { buildShoe, shuffleDeck, handValue, isBlackjack, CHIP_VALUES } from "../../engine/casino/blackjack.js";
import PlayingCard from "./PlayingCard.jsx";
import { styles, COLORS, CSS_EXTRA } from "../../styles/theme.js";

export default function CasinoScreen({ cash, currency, onCashDelta, onBack, handsPlayed, netResult, onHandPlayed }) {
  const f = (n) => fmt(n, currency);
  const shoeRef = useRef(shuffleDeck(buildShoe(6)));
  const [phase, setPhase] = useState("betting"); // betting | playing | settled
  const [bet, setBet] = useState(0);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [dealerHidden, setDealerHidden] = useState(true);
  const [resultMsg, setResultMsg] = useState(null);
  const [customBetInput, setCustomBetInput] = useState("");

  function drawCard() {
    if (shoeRef.current.length < 20) shoeRef.current = shuffleDeck(buildShoe(6));
    return shoeRef.current.pop();
  }

  function addChip(v) {
    if (phase !== "betting") return;
    if (bet + v > cash) return;
    setBet((b) => b + v);
  }
  function clearBet() { if (phase === "betting") setBet(0); }
  function setCustomBet() {
    if (phase !== "betting") return;
    const v = Math.max(0, Math.floor(Number(customBetInput) || 0));
    setBet(Math.min(v, cash));
    setCustomBetInput("");
  }

  function settle(finalPlayer, finalDealer, currentBet) {
    const pv = handValue(finalPlayer).total;
    const dv = handValue(finalDealer).total;
    const playerBJ = isBlackjack(finalPlayer);
    const dealerBJ = isBlackjack(finalDealer);
    const dealerBust = dv > 21;
    // payout = montant total reversé par la banque (mise comprise si gagnée ou égalité, 0 si perdue)
    let outcome, payout;
    if (pv > 21) { outcome = "Perdu (dépassé 21)"; payout = 0; }
    else if (playerBJ && dealerBJ) { outcome = "Égalité (blackjack des deux côtés)"; payout = currentBet; }
    else if (playerBJ) { outcome = "Blackjack ! Vous gagnez"; payout = Math.round(currentBet * 2.5); }
    else if (dealerBJ) { outcome = "Le croupier a un blackjack"; payout = 0; }
    else if (dealerBust) { outcome = "Le croupier dépasse 21, vous gagnez"; payout = currentBet * 2; }
    else if (pv > dv) { outcome = "Vous gagnez"; payout = currentBet * 2; }
    else if (pv < dv) { outcome = "Vous perdez"; payout = 0; }
    else { outcome = "Égalité"; payout = currentBet; }

    const netProfit = payout - currentBet;
    if (payout > 0) onCashDelta(payout);
    setDealerCards(finalDealer);
    setDealerHidden(false);
    setResultMsg({ outcome, payout: netProfit });
    onHandPlayed(netProfit);
    setPhase("settled");
  }

  function deal() {
    if (bet <= 0 || bet > cash) return;
    onCashDelta(-bet);
    const p = [drawCard(), drawCard()];
    const d = [drawCard(), drawCard()];
    setPlayerCards(p); setDealerCards(d); setDealerHidden(true);
    setResultMsg(null);
    if (isBlackjack(p) || isBlackjack(d)) {
      setTimeout(() => settle(p, d, bet), 500);
    } else {
      setPhase("playing");
    }
  }

  function hit() {
    const p = [...playerCards, drawCard()];
    setPlayerCards(p);
    if (handValue(p).total > 21) setTimeout(() => settle(p, dealerCards, bet), 400);
  }

  function playDealerAndSettle(p, currentBet) {
    let d = [...dealerCards];
    while (handValue(d).total < 17) d = [...d, drawCard()];
    setDealerHidden(false);
    setTimeout(() => settle(p, d, currentBet), 500);
  }

  function stand() { playDealerAndSettle(playerCards, bet); }

  function doubleDown() {
    if (playerCards.length !== 2 || bet > cash) return;
    onCashDelta(-bet);
    const newBet = bet * 2;
    setBet(newBet);
    const p = [...playerCards, drawCard()];
    setPlayerCards(p);
    if (handValue(p).total > 21) setTimeout(() => settle(p, dealerCards, newBet), 400);
    else playDealerAndSettle(p, newBet);
  }

  function nextHand() {
    setBet(0); setPlayerCards([]); setDealerCards([]); setDealerHidden(true); setResultMsg(null);
    setPhase("betting");
  }

  const pVal = handValue(playerCards);
  const dVal = handValue(dealerCards);

  return (
    <div style={{ ...styles.app, overflowY: "auto", padding: "16px 14px 40px", alignItems: "center", display: "flex", flexDirection: "column" }}>
      <style>{CSS_EXTRA}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 420, marginBottom: 10 }}>
        <button className="btn-small" style={styles.smallBtn} onClick={onBack}>← Retour</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.ink, fontWeight: 700 }}>🎰 Casino — Blackjack</div>
        <div style={{ width: 70 }} />
      </div>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, textAlign: "center", marginBottom: 14 }}>
        Liquidités : <b style={{ color: COLORS.ink }}>{f(cash)}</b> · {handsPlayed} main(s) jouée(s)
        <div style={{ fontSize: 10, marginTop: 2 }}>Gains/pertes cumulés au casino (déjà inclus ci-dessus) : <b style={{ color: netResult >= 0 ? COLORS.teal : COLORS.rust }}>{netResult >= 0 ? "+" : ""}{f(netResult)}</b></div>
      </div>

      <div style={{ ...styles.ledger, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Croupier {phase !== "betting" && !dealerHidden ? `(${dVal.total}${dVal.soft ? " souple" : ""})` : ""}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", minHeight: 70 }}>
          {dealerCards.map((c, i) => <PlayingCard key={i} card={c} hidden={dealerHidden && i === 1} />)}
        </div>

        <div style={{ ...styles.ledgerDivider, margin: "14px 0" }} />

        <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Vous {playerCards.length > 0 ? `(${pVal.total}${pVal.soft ? " souple" : ""})` : ""}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", minHeight: 70 }}>
          {playerCards.map((c, i) => <PlayingCard key={i} card={c} />)}
        </div>

        {resultMsg && (
          <div className="banner-in" style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, border: `1.5px dashed ${resultMsg.payout > 0 ? COLORS.teal : resultMsg.payout < 0 ? COLORS.rust : COLORS.inkSoft}` }}>
            <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 13 }}>{resultMsg.outcome}</div>
            {resultMsg.payout !== 0 && <div style={{ fontSize: 12, color: resultMsg.payout > 0 ? COLORS.teal : COLORS.rust, marginTop: 2 }}>{resultMsg.payout > 0 ? "+" : ""}{f(resultMsg.payout)}</div>}
          </div>
        )}

        {phase === "betting" && (
          <>
            <div style={{ fontSize: 13, color: COLORS.ink, marginTop: 14 }}>Mise : <b>{f(bet)}</b></div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
              {CHIP_VALUES.map((v) => (
                <button key={v} className="btn-small" style={{ ...styles.smallBtn, opacity: cash >= bet + v ? 1 : 0.4 }} disabled={cash < bet + v} onClick={() => addChip(v)}>+{f(v)}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center", justifyContent: "center" }}>
              <input type="number" min="0" placeholder="Montant exact" value={customBetInput} onChange={(e) => setCustomBetInput(e.target.value)} style={{ ...styles.formInputSmall, width: 110 }} />
              <button className="btn-small" style={styles.smallBtn} onClick={setCustomBet}>Miser ce montant</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={clearBet}>Effacer</button>
              <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1, opacity: bet > 0 ? 1 : 0.4 }} disabled={bet <= 0} onClick={deal}>Distribuer</button>
            </div>
          </>
        )}

        {phase === "playing" && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn-primary" style={{ ...styles.primaryBtn, flex: 1 }} onClick={hit}>Tirer</button>
            <button className="btn-small" style={{ ...styles.smallBtn, flex: 1 }} onClick={stand}>Rester</button>
            <button className="btn-small" style={{ ...styles.smallBtn, flex: 1, opacity: (playerCards.length === 2 && bet <= cash) ? 1 : 0.4 }} disabled={!(playerCards.length === 2 && bet <= cash)} onClick={doubleDown}>Doubler</button>
          </div>
        )}

        {phase === "settled" && (
          <button className="btn-primary" style={{ ...styles.primaryBtn, width: "100%", boxSizing: "border-box", marginTop: 14 }} onClick={nextHand}>Nouvelle main</button>
        )}
      </div>

      <div style={{ fontSize: 10, color: COLORS.inkSoft, marginTop: 14, textAlign: "center", maxWidth: 340 }}>
        Sabot de 6 paquets, blackjack payé 3:2. Version simplifiée (pas de mises annexes, pas de partage de main).
      </div>
    </div>
  );
}
