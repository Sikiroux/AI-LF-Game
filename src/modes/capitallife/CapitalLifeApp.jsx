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
import AssetIncidentModal from "./components/modals/AssetIncidentModal.jsx";
import ForecastScreen from "./components/apps/ForecastScreen.jsx";
import CapitalLifeManualScreen from "./components/screens/CapitalLifeManualScreen.jsx";

export default function CapitalLifeApp({ onExitHome }) {
  const {
    loaded, view, setView, phase,
    scenarioDraft, scenarioPresetKey, changeScenarioPreset, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debts, liabilities, kids, assets, passiveIncome, currentDebtPayments, hasSave, resetGame, nextDay, skipMonth,
    skipWeek, skipToTrainingEnd,
    payOffLiability, payOffDebt, takePersonalLoan,
    skipMonthMode, setSkipMonthMode,
    managementThresholdPct, setManagementThresholdPct,
    babyEnabled, setBabyEnabled, layoffEnabled, setLayoffEnabled, layoffMonthsLeft, lastEvent, lastSkipReport,
    tokens, portfolio, journal, marketTurn, traderJournalActive, onToggleTraderJournal, buyStock, sellStock,
    listings, pendingDecision, openListing, skipListing, buyListing, inspectListing, negotiateListing,
    payOffLoan, startAmortization, cancelAmortization, payOffAllLoans,
    selectedAssetId, setSelectedAssetId, performAssetMaintenance, performAssetAd,
    hireAssetEmployee, fireAssetEmployee, trainAssetEmployee, buyAssetStake,
    payAssetDividend, toggleAssetAutoManage,
    performAssetRenovation, performPickTenant, performOpenSecondLocation, performSellAsset,
    consolidateDebts,
    economicModifier, sectorConditions,
    casinoHandsPlayed, casinoNetResult, actionPoints, onCasinoCashDelta, onCasinoHandPlayed,
    currency, setCurrency,
    dailyActionPoints, difficulty, setDifficulty,
    skills, training, qualifications, missions, fatigue, enCouple, lastJobRejectionDay,
    beginTraining, beginCareerProgram, applyToJob, doMission,
    rentTier, changeRentTier,
    consecutiveWinningPaydays, winStreakTarget,
    assetDecision, resolveAssetDecision,
  } = useCapitalLifeState();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") {
    return <CapitalLifeMenuScreen hasSave={hasSave} onResume={() => setView("game")} onNew={goToNewScenario} onOptions={() => setView("options")} onOpenManual={() => setView("manual")} onExitHome={onExitHome} />;
  }
  if (view === "manual") {
    return <CapitalLifeManualScreen onBack={() => setView("menu")} />;
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
        onBack={() => setView("menu")}
      />
    );
  }
  if (view === "scenario") {
    return (
      <ScenarioScreen
        scenario={scenarioDraft} currency={currency}
        difficulty={difficulty} onChangeDifficulty={setDifficulty}
        presetKey={scenarioPresetKey} onChangePreset={changeScenarioPreset}
        onStart={startGame} onReroll={rerollScenario} onBack={() => setView("menu")}
      />
    );
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
        onAd={performAssetAd}
        onHire={(candidate) => hireAssetEmployee(selectedAssetId, candidate)}
        onFire={(employeeId) => fireAssetEmployee(selectedAssetId, employeeId)}
        onTrain={(employeeId) => trainAssetEmployee(selectedAssetId, employeeId)}
        onBuyStake={(assetId, delta, useLoan) => buyAssetStake(assetId, delta, useLoan)}
        onPayDividend={(amount) => payAssetDividend(selectedAssetId, amount)}
        onToggleAutoManage={() => toggleAssetAutoManage(selectedAssetId)}
        onRenovate={performAssetRenovation}
        onPickTenant={performPickTenant}
        onOpenSecondLocation={performOpenSecondLocation}
        onSell={(assetId, sale) => { performSellAsset(assetId, sale); setView("assets"); }}
        marketConditions={{ economicModifier: economicModifier?.loanRateMult ?? 1, sectorConditions }}
        onBack={() => setView("assets")}
      />
    );
  }
  if (view === "career") {
    return (
      <CareerScreen
        profession={profession} skills={skills} training={training} qualifications={qualifications} missions={missions}
        cash={cash} currency={currency} day={day} actionPoints={actionPoints} dailyActionPoints={dailyActionPoints}
        fatigue={fatigue} enCouple={enCouple} lastJobRejectionDay={lastJobRejectionDay}
        rentTier={rentTier}
        onBeginTraining={beginTraining} onBeginCareerProgram={beginCareerProgram} onApplyToJob={applyToJob} onDoMission={doMission} onChangeRentTier={changeRentTier}
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
        onConsolidateDebts={consolidateDebts}
        onTakePersonalLoan={takePersonalLoan}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "skipReport") {
    return <SkipReportScreen report={lastSkipReport} currency={currency} onBack={() => setView("game")} />;
  }
  if (view === "forecast") {
    return (
      <ForecastScreen
        day={day} cash={cash} profession={profession} debts={debts} liabilities={liabilities}
        kids={kids} assets={assets} rentTier={rentTier} currency={currency}
        onBack={() => setView("game")}
      />
    );
  }
  if (view === "opportunities") {
    return (
      <>
        <OpportunitySiteScreen listings={listings} day={day} cash={cash} currency={currency} actionPoints={actionPoints} onOpen={openListing} onInspect={inspectListing} onNegotiate={negotiateListing} onBack={() => setView("game")} />
        {pendingDecision && (
          <DecisionModal
            decision={pendingDecision}
            cash={cash}
            fastCash={0}
            currency={currency}
            downPaymentPct={10}
            financingMode="realistic"
            yieldMode="realiste"
            customYieldMultiplier={1}
            loanRateMult={1}
            debtRatioEnabled={true}
            currentDebtPayments={currentDebtPayments}
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
    <>
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
      skills={skills}
      consecutiveWinningPaydays={consecutiveWinningPaydays}
      winStreakTarget={winStreakTarget}
      assetsNeedingAttention={assets.filter((a) => a.condition != null && a.condition < 50).length}
      skipMonthMode={skipMonthMode}
      onChangeSkipMonthMode={setSkipMonthMode}
      onNextDay={nextDay}
      onSkipMonth={skipMonth}
      onSkipWeek={skipWeek}
      onSkipToTrainingEnd={training ? skipToTrainingEnd : null}
      onOpenApp={(key) => setView(key)}
      onOpenSkipReport={() => setView("skipReport")}
      onMenu={() => setView("menu")}
    />
    {assetDecision && <AssetIncidentModal decision={assetDecision} actionPoints={actionPoints} onChoose={resolveAssetDecision} />}
    </>
  );
}
