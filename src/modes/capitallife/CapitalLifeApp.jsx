import useCapitalLifeState from "./state/useCapitalLifeState.js";
import LoadingScreen from "../../components/screens/LoadingScreen.jsx";
import TradingScreen from "../../components/trading/TradingScreen.jsx";
import CasinoScreen from "../../components/casino/CasinoScreen.jsx";
import AssetsScreen from "../../components/ledger/AssetsScreen.jsx";
import DecisionModal from "../../components/modals/DecisionModal.jsx";
import CapitalLifeMenuScreen from "./components/screens/CapitalLifeMenuScreen.jsx";
import CapitalLifeOptionsScreen from "./components/screens/CapitalLifeOptionsScreen.jsx";
import ScenarioScreen from "./components/screens/ScenarioScreen.jsx";
import OpportunitySiteScreen from "./components/screens/OpportunitySiteScreen.jsx";
import CapitalLifeWonScreen from "./components/screens/CapitalLifeWonScreen.jsx";
import CapitalLifeHomeScreen from "./components/shell/CapitalLifeHomeScreen.jsx";
import FinancesScreen from "./components/apps/FinancesScreen.jsx";

export default function CapitalLifeApp({ onExitHome }) {
  const {
    loaded, view, setView, phase,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, kids, assets, passiveIncome, hasSave, resetGame, nextDay, skipMonth,
    skipMonthMode, setSkipMonthMode,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft, lastEvent,
    tokens, portfolio, journal, marketTurn, traderJournalActive, onToggleTraderJournal, buyStock, sellStock,
    listings, pendingDecision, openListing, skipListing, buyListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    casinoHandsPlayed, casinoNetResult, onCasinoCashDelta, onCasinoHandPlayed,
    currency, setCurrency,
  } = useCapitalLifeState();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") {
    return <CapitalLifeMenuScreen hasSave={hasSave} onResume={() => setView("game")} onNew={goToNewScenario} onOptions={() => setView("options")} onExitHome={onExitHome} />;
  }
  if (view === "options") {
    return (
      <CapitalLifeOptionsScreen
        currency={currency}
        onSelectCurrency={setCurrency}
        babyEnabled={babyEnabled}
        onToggleBaby={() => setBabyEnabled((v) => !v)}
        layoffEnabled={layoffEnabled}
        onToggleLayoff={() => setLayoffEnabled((v) => !v)}
        skipMonthMode={skipMonthMode}
        onChangeSkipMonthMode={setSkipMonthMode}
        onBack={() => setView("menu")}
      />
    );
  }
  if (view === "scenario") {
    return <ScenarioScreen scenario={scenarioDraft} currency={currency} onStart={startGame} onReroll={rerollScenario} onBack={() => setView("menu")} />;
  }
  if (phase === "won") {
    return <CapitalLifeWonScreen day={day} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} debts={debts} currency={currency} onReset={resetGame} />;
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
  if (view === "casino") {
    return <CasinoScreen cash={cash} currency={currency} onCashDelta={onCasinoCashDelta} handsPlayed={casinoHandsPlayed} netResult={casinoNetResult} onHandPlayed={onCasinoHandPlayed} onBack={() => setView("game")} />;
  }
  if (view === "assets") {
    return <AssetsScreen assets={assets} cash={cash} currency={currency} onPayOff={payOffLoan} onPayOffAll={payOffAllLoans} onStartAmortization={startAmortization} onCancelAmortization={cancelAmortization} onBack={() => setView("game")} />;
  }
  if (view === "finances") {
    return (
      <FinancesScreen
        day={day}
        profession={profession}
        kids={kids}
        debts={debts}
        passiveIncome={passiveIncome}
        layoffMonthsLeft={layoffMonthsLeft}
        currency={currency}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "opportunities") {
    return (
      <>
        <OpportunitySiteScreen listings={listings} day={day} cash={cash} currency={currency} onOpen={openListing} onBack={() => setView("game")} />
        {pendingDecision && (
          <DecisionModal
            decision={pendingDecision}
            cash={cash}
            fastCash={0}
            currency={currency}
            downPaymentPct={10}
            financingMode="simple"
            yieldMode="realiste"
            customYieldMultiplier={1}
            loanRateMult={1}
            debtRatioEnabled={true}
            currentDebtPayments={debts.reduce((s, d) => s + d.monthlyPayment, 0) + assets.reduce((s, a) => s + (a.loanMonthly || 0), 0)}
            totalIncome={profession ? profession.salary + passiveIncome : 0}
            onBuy={(card, mode) => buyListing(card, mode, pendingDecision.listingId)}
            onSkip={skipListing}
            onMarket={() => {}}
            onCharity={() => {}}
            onDoodadCash={() => {}}
            onDoodadFinance={() => {}}
            onBuyFast={() => {}}
            onSkipFast={() => {}}
            onCharityFast={() => {}}
          />
        )}
      </>
    );
  }
  return (
    <CapitalLifeHomeScreen
      day={day}
      cash={cash}
      profession={profession}
      debts={debts}
      kids={kids}
      assets={assets}
      passiveIncome={passiveIncome}
      layoffMonthsLeft={layoffMonthsLeft}
      currency={currency}
      onNextDay={nextDay}
      onSkipMonth={skipMonth}
      onOpenApp={(key) => setView(key)}
      onMenu={() => setView("menu")}
    />
  );
}
