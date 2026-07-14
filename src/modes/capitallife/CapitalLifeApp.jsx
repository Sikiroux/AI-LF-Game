import useCapitalLifeState from "./state/useCapitalLifeState.js";
import LoadingScreen from "../../components/screens/LoadingScreen.jsx";
import DecisionModal from "../../components/modals/DecisionModal.jsx";
import CapitalLifeMenuScreen from "./components/screens/CapitalLifeMenuScreen.jsx";
import CapitalLifeOptionsScreen from "./components/screens/CapitalLifeOptionsScreen.jsx";
import ScenarioScreen from "./components/screens/ScenarioScreen.jsx";
import OpportunitySiteScreen from "./components/screens/OpportunitySiteScreen.jsx";
import CapitalLifeWonScreen from "./components/screens/CapitalLifeWonScreen.jsx";
import BankruptScreen from "../../components/screens/BankruptScreen.jsx";
import CapitalLifeHomeScreen from "./components/shell/CapitalLifeHomeScreen.jsx";
import FinancesScreen from "./components/apps/FinancesScreen.jsx";
import SkipReportScreen from "./components/screens/SkipReportScreen.jsx";
import TradingScreen from "./components/apps/TradingScreen.jsx";
import CasinoScreen from "./components/apps/CasinoScreen.jsx";
import AssetsScreen from "./components/apps/AssetsScreen.jsx";
import AssetDetailScreen from "./components/apps/AssetDetailScreen.jsx";
import CareerScreen from "./components/apps/CareerScreen.jsx";
import DebtsScreen from "../../components/ledger/DebtsScreen.jsx";

export default function CapitalLifeApp({ onExitHome }) {
  const {
    loaded, view, setView, phase,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, liabilities, kids, assets, passiveIncome, hasSave, resetGame, nextDay, skipMonth,
    payOffLiability, payOffDebt,
    skipMonthMode, setSkipMonthMode,
    managementThresholdPct, setManagementThresholdPct,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft, lastEvent, lastSkipReport,
    tokens, portfolio, journal, marketTurn, traderJournalActive, onToggleTraderJournal, buyStock, sellStock,
    listings, pendingDecision, openListing, skipListing, buyListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    selectedAssetId, setSelectedAssetId, performAssetMaintenance,
    hireAssetEmployee, fireAssetEmployee, trainAssetEmployee, buyAssetStake,
    casinoHandsPlayed, casinoNetResult, actionPoints, onCasinoCashDelta, onCasinoHandPlayed,
    currency, setCurrency,
    dailyActionPoints, setDailyActionPoints,
    skills, training, missions, daysWithoutRest, enCouple, lastJobRejectionDay,
    beginTraining, applyToJob, doMission,
    rentTier, changeRentTier,
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
        managementThresholdPct={managementThresholdPct}
        onChangeManagementThreshold={setManagementThresholdPct}
        dailyActionPoints={dailyActionPoints}
        onChangeDailyActionPoints={setDailyActionPoints}
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
  if (phase === "bankrupt") {
    const bankLoanBalance = debts.reduce((s, d) => s + d.balance, 0);
    return <BankruptScreen turnCount={day} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} bankLoanBalance={bankLoanBalance} currency={currency} onReset={resetGame} />;
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
    return (
      <AssetsScreen
        assets={assets} cash={cash} currency={currency}
        onPayOff={payOffLoan} onPayOffAll={payOffAllLoans}
        onStartAmortization={startAmortization} onCancelAmortization={cancelAmortization}
        onSelect={(id) => { setSelectedAssetId(id); setView("assetDetail"); }}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "assetDetail") {
    return (
      <AssetDetailScreen
        asset={assets.find((a) => a.id === selectedAssetId)}
        cash={cash} currency={currency} day={day} actionPoints={actionPoints}
        managementThreshold={managementThresholdPct}
        onMaintenance={performAssetMaintenance}
        onHire={(candidate) => hireAssetEmployee(selectedAssetId, candidate)}
        onFire={(employeeId) => fireAssetEmployee(selectedAssetId, employeeId)}
        onTrain={(employeeId) => trainAssetEmployee(selectedAssetId, employeeId)}
        onBuyStake={(assetId, delta, useLoan) => buyAssetStake(assetId, delta, useLoan)}
        onBack={() => setView("assets")}
      />
    );
  }
  if (view === "career") {
    return (
      <CareerScreen
        profession={profession} skills={skills} training={training} missions={missions}
        cash={cash} currency={currency} day={day} actionPoints={actionPoints} dailyActionPoints={dailyActionPoints}
        daysWithoutRest={daysWithoutRest} enCouple={enCouple} lastJobRejectionDay={lastJobRejectionDay}
        rentTier={rentTier}
        onBeginTraining={beginTraining} onApplyToJob={applyToJob} onDoMission={doMission} onChangeRentTier={changeRentTier}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "finances") {
    return (
      <FinancesScreen
        day={day}
        profession={profession}
        kids={kids}
        debts={debts}
        liabilities={liabilities}
        passiveIncome={passiveIncome}
        layoffMonthsLeft={layoffMonthsLeft}
        currency={currency}
        rentTier={rentTier}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "debts") {
    return (
      <DebtsScreen
        variant="capitallife"
        profession={profession}
        liabilities={liabilities}
        extraDebts={debts}
        cash={cash}
        currency={currency}
        onPayOffLiability={payOffLiability}
        onPayOffDebt={payOffDebt}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "skipReport") {
    return <SkipReportScreen report={lastSkipReport} currency={currency} onBack={() => setView("game")} />;
  }
  if (view === "opportunities") {
    return (
      <>
        <OpportunitySiteScreen listings={listings} day={day} cash={cash} currency={currency} actionPoints={actionPoints} onOpen={openListing} onBack={() => setView("game")} />
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
      liabilities={liabilities}
      kids={kids}
      assets={assets}
      passiveIncome={passiveIncome}
      layoffMonthsLeft={layoffMonthsLeft}
      currency={currency}
      lastEvent={lastEvent}
      hasSkipReport={!!lastSkipReport}
      actionPoints={actionPoints}
      rentTier={rentTier}
      assetsNeedingAttention={assets.filter((a) => a.condition != null && a.condition < 50).length}
      skipMonthMode={skipMonthMode}
      onChangeSkipMonthMode={setSkipMonthMode}
      onNextDay={nextDay}
      onSkipMonth={skipMonth}
      onOpenApp={(key) => setView(key)}
      onOpenSkipReport={() => setView("skipReport")}
      onMenu={() => setView("menu")}
    />
  );
}
