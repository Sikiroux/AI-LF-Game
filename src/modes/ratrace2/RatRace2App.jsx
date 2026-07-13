import useRatRace2State from "./state/useRatRace2State.js";
import LoadingScreen from "../../components/screens/LoadingScreen.jsx";
import TradingScreen from "../../components/trading/TradingScreen.jsx";
import RatRace2MenuScreen from "./components/screens/RatRace2MenuScreen.jsx";
import ScenarioScreen from "./components/screens/ScenarioScreen.jsx";
import MonthHub from "./components/hub/MonthHub.jsx";

export default function RatRace2App({ onExitHome }) {
  const {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, kids, hasSave, resetGame, nextDay,
    layoffMonthsLeft, lastEvent,
    tokens, portfolio, journal, marketTurn, traderJournalActive, onToggleTraderJournal, buyStock, sellStock,
    currency,
  } = useRatRace2State();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") {
    return <RatRace2MenuScreen hasSave={hasSave} onResume={() => setView("game")} onNew={goToNewScenario} onExitHome={onExitHome} />;
  }
  if (view === "scenario") {
    return <ScenarioScreen scenario={scenarioDraft} currency={currency} onStart={startGame} onReroll={rerollScenario} onBack={() => setView("menu")} />;
  }
  if (view === "trading") {
    return (
      <TradingScreen
        tokens={tokens}
        portfolio={portfolio}
        journal={journal}
        cash={cash}
        currency={currency}
        marketTurn={marketTurn}
        traderJournalActive={traderJournalActive}
        onToggleTraderJournal={onToggleTraderJournal}
        onBuy={buyStock}
        onSell={sellStock}
        onBack={() => setView("game")}
        advanceHint="le marché avance d'un jour à chaque fois que vous passez au jour suivant."
        advanceSubHint="Retourne au hub et avance d'un jour (ou saute le mois) pour faire évoluer tes positions."
      />
    );
  }
  return (
    <MonthHub
      day={day}
      cash={cash}
      profession={profession}
      debts={debts}
      kids={kids}
      layoffMonthsLeft={layoffMonthsLeft}
      lastEvent={lastEvent}
      currency={currency}
      onNextDay={nextDay}
      onMenu={() => setView("menu")}
      onTrading={() => setView("trading")}
    />
  );
}
