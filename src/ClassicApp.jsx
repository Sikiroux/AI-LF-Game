import useGameState from "./state/useGameState.js";
import { styles, CSS_EXTRA } from "./styles/theme.js";

import LoadingScreen from "./components/screens/LoadingScreen.jsx";
import MenuScreen from "./components/screens/MenuScreen.jsx";
import OptionsScreen from "./components/screens/OptionsScreen.jsx";
import CustomJobScreen from "./components/screens/CustomJobScreen.jsx";
import SetupScreen from "./components/screens/SetupScreen.jsx";
import MultiplayerSetupScreen from "./components/screens/MultiplayerSetupScreen.jsx";
import MultiplayerEndScreen from "./components/screens/MultiplayerEndScreen.jsx";
import WonScreen from "./components/screens/WonScreen.jsx";
import BankruptScreen from "./components/screens/BankruptScreen.jsx";
import RulesScreen from "./components/screens/RulesScreen.jsx";

import TradingScreen from "./components/trading/TradingScreen.jsx";
import CasinoScreen from "./components/casino/CasinoScreen.jsx";
import AssetsScreen from "./components/ledger/AssetsScreen.jsx";
import DebtsScreen from "./components/ledger/DebtsScreen.jsx";

import Header from "./components/Header.jsx";
import FastBoard from "./components/board/FastBoard.jsx";
import RatBoard from "./components/board/RatBoard.jsx";
import EventBanner from "./components/board/EventBanner.jsx";
import PlayersPanel from "./components/board/PlayersPanel.jsx";
import FastLedger from "./components/ledger/FastLedger.jsx";
import Ledger from "./components/ledger/Ledger.jsx";
import DecisionModal from "./components/modals/DecisionModal.jsx";

export default function ClassicApp({ onExitHome }) {
  const {
    isDesktop, setIsDesktop,
    loaded,
    view, setView,
    phase, setPhase,
    currency, setCurrency,
    downPaymentPct, setDownPaymentPct,
    customJobs, setCustomJobs,
    profession, setProfession,
    dream, setDream,
    winReason, setWinReason,
    position, setPosition,
    displayPosition, setDisplayPosition,
    moving, setMoving,
    cash, setCash,
    kids, setKids,
    assets, setAssets,
    liabilities, setLiabilities,
    extraMonthly, setExtraMonthly,
    extraDebtBalance, setExtraDebtBalance,
    bankLoanBalance, setBankLoanBalance,
    casinoHandsPlayed, setCasinoHandsPlayed,
    casinoNetResult, setCasinoNetResult,
    charityTurnsLeft, setCharityTurnsLeft,
    skipTurns, setSkipTurns,
    dice, setDice,
    diceRolling, setDiceRolling,
    lastEvent, setLastEvent,
    pendingDecision, setPendingDecision,
    fastTrack, setFastTrack,
    fastDisplayPosition, setFastDisplayPosition,
    turnCount, setTurnCount,
    marketTurn, setMarketTurn,
    tokens, setTokens,
    pendingArcs, setPendingArcs,
    sectorConditions, setSectorConditions,
    economicModifier, setEconomicModifier,
    traderJournalActive, setTraderJournalActive,
    economicEffectDuration, setEconomicEffectDuration,
    economicEffectPermanent, setEconomicEffectPermanent,
    bourseEnabled, setBourseEnabled,
    casinoEnabled, setCasinoEnabled,
    debtRatioEnabled, setDebtRatioEnabled,
    proceduralCards, setProceduralCards,
    marketIncomeCardsEnabled, setMarketIncomeCardsEnabled,
    marketIncomeDurationMode, setMarketIncomeDurationMode,
    marketIncomeDurationTurns, setMarketIncomeDurationTurns,
    activeSmallDeals, setActiveSmallDeals,
    activeBigDeals, setActiveBigDeals,
    financingMode, setFinancingMode,
    yieldMode, setYieldMode,
    customYieldMultiplier, setCustomYieldMultiplier,
    portfolio, setPortfolio,
    journal, setJournal,

    multiplayer, players, currentPlayerIndex, hasRolled,
    mpConfigs, mpResults, mpGameOver, mpWinnerId, mpEndReason,

    passiveIncome, totalExpenses, totalIncome, netCashflow, currentDebtPayments, hasSave,

    cycleCurrency,
    startGame,
    enterFastTrack,
    resetGame,
    goMultiplayerSetup,
    beginMultiplayerGame,
    submitMpHumanSetup,
    finishTurn,
    banner,
    takeBankLoan,
    repayBankLoan,
    advanceMarket,
    buyStock,
    sellStock,
    amortizeAssets,
    payDoodadCash,
    financeDoodad,
    payPaycheck,
    payOrLiquidate,
    resolveRatSquare,
    resolveFastSquare,
    buyFastBusiness,
    skipFastBusiness,
    resolveFastCharity,
    rollDice,
    payOffLiability,
    payOffLoan,
    payOffAllLoans,
    startAmortization,
    cancelAmortization,
    buyAsset,
    skipAsset,
    resolveMarketSell,
    resolveCharity,
  } = useGameState();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") return <MenuScreen hasSave={hasSave} profession={profession} phase={phase} cash={cash} currency={currency} multiplayer={multiplayer} players={players} currentPlayerIndex={currentPlayerIndex} onResume={() => setView("game")} onNew={resetGame} onMultiplayer={goMultiplayerSetup} onOptions={() => setView("options")} onRules={() => setView("rules")} onExitHome={onExitHome} />;
  if (view === "rules") return <RulesScreen onBack={() => setView(hasSave ? "game" : "menu")} />;
  if (view === "options") return <OptionsScreen currency={currency} onSelectCurrency={setCurrency} downPaymentPct={downPaymentPct} onChangeDownPayment={setDownPaymentPct} financingMode={financingMode} onChangeFinancingMode={setFinancingMode} yieldMode={yieldMode} onChangeYieldMode={setYieldMode} customYieldMultiplier={customYieldMultiplier} onChangeCustomYield={setCustomYieldMultiplier} proceduralCards={proceduralCards} onToggleProceduralCards={() => setProceduralCards((v) => !v)} marketIncomeCardsEnabled={marketIncomeCardsEnabled} onToggleMarketIncomeCards={() => setMarketIncomeCardsEnabled((v) => !v)} marketIncomeDurationMode={marketIncomeDurationMode} onChangeMarketIncomeDurationMode={setMarketIncomeDurationMode} marketIncomeDurationTurns={marketIncomeDurationTurns} onChangeMarketIncomeDurationTurns={setMarketIncomeDurationTurns} debtRatioEnabled={debtRatioEnabled} onToggleDebtRatio={() => setDebtRatioEnabled((v) => !v)} economicEffectDuration={economicEffectDuration} onChangeEconomicDuration={setEconomicEffectDuration} economicEffectPermanent={economicEffectPermanent} onTogglePermanent={() => setEconomicEffectPermanent((v) => !v)} bourseEnabled={bourseEnabled} onToggleBourse={() => setBourseEnabled((v) => !v)} casinoEnabled={casinoEnabled} onToggleCasino={() => setCasinoEnabled((v) => !v)} onBack={() => setView("menu")} onClearSave={() => { resetGame(); setView("menu"); }} hasSave={hasSave} onManageJobs={() => setView("customjobs")} />;
  if (view === "customjobs") return <CustomJobScreen customJobs={customJobs} currency={currency} onCreate={(job) => setCustomJobs((j) => [...j, job])} onDelete={(id) => setCustomJobs((j) => j.filter((x) => x.id !== id))} onBack={() => setView("menu")} />;
  if (view === "mpsetup") return <MultiplayerSetupScreen onBack={() => setView("menu")} onStart={beginMultiplayerGame} />;
  if (view === "setup") return (
    <SetupScreen
      key={multiplayer && mpConfigs ? `mp-${mpResults.length}` : "solo"}
      onStart={multiplayer && mpConfigs ? submitMpHumanSetup : startGame}
      currency={currency}
      onSelectCurrency={setCurrency}
      onBack={() => setView("menu")}
      customJobs={customJobs}
      onCreateJob={() => setView("customjobs")}
      onDeleteJob={(id) => setCustomJobs((j) => j.filter((x) => x.id !== id))}
      mpSetupLabel={multiplayer && mpConfigs ? `Configuration — ${mpConfigs[mpResults.length]?.name} (joueur ${mpResults.length + 1}/${mpConfigs.length})` : null}
    />
  );
  if (view === "trading") return (
    <TradingScreen
      tokens={tokens}
      portfolio={portfolio}
      journal={journal}
      cash={cash}
      currency={currency}
      marketTurn={marketTurn}
      traderJournalActive={traderJournalActive}
      onToggleTraderJournal={() => setTraderJournalActive((v) => !v)}
      onBuy={buyStock}
      onSell={sellStock}
      onBack={() => setView("game")}
    />
  );
  if (view === "casino") return <CasinoScreen cash={cash} currency={currency} onCashDelta={(amount) => setCash((c) => Math.max(0, c + amount))} handsPlayed={casinoHandsPlayed} netResult={casinoNetResult} onHandPlayed={(netProfit) => { setCasinoHandsPlayed((n) => n + 1); setCasinoNetResult((n) => n + netProfit); }} onBack={() => setView("game")} />;
  if (view === "assets") return <AssetsScreen assets={assets} cash={cash} currency={currency} onPayOff={payOffLoan} onPayOffAll={payOffAllLoans} onStartAmortization={startAmortization} onCancelAmortization={cancelAmortization} onBack={() => setView("game")} />;
  if (view === "debts") return <DebtsScreen variant="classic" profession={profession} liabilities={liabilities} cash={cash} currency={currency} onPayOffLiability={payOffLiability} onPayOffDebt={() => {}} onBack={() => setView("game")} />;
  if (multiplayer && mpGameOver) return <MultiplayerEndScreen players={players} winnerId={mpWinnerId} endReason={mpEndReason} turnCount={turnCount} currency={currency} onReset={resetGame} />;
  if (!multiplayer && phase === "won") return <WonScreen fastTrack={fastTrack} winReason={winReason} turnCount={turnCount} onReset={resetGame} currency={currency} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} bankLoanBalance={bankLoanBalance} />;
  if (!multiplayer && phase === "bankrupt") return <BankruptScreen turnCount={turnCount} onReset={resetGame} profession={profession} assets={assets} passiveIncome={passiveIncome} tokens={tokens} portfolio={portfolio} casinoHandsPlayed={casinoHandsPlayed} casinoNetResult={casinoNetResult} bankLoanBalance={bankLoanBalance} currency={currency} />;

  const currentPlayer = multiplayer ? players[currentPlayerIndex] : null;
  const isAiTurn = !!(currentPlayer && currentPlayer.isAI);
  const boardLocked = multiplayer && (isAiTurn || (hasRolled && !pendingDecision));
  const boardLockedLabel = isAiTurn ? "Tour de l'IA…" : "Tour terminé";
  const endTurnReady = multiplayer && !isAiTurn && hasRolled && !pendingDecision && !diceRolling && !moving && phase !== "won" && phase !== "bankrupt";

  return (
    <div style={styles.app}>
      <style>{CSS_EXTRA}</style>
      <Header profession={profession} phase={phase} onMenu={() => setView("menu")} onTrading={() => setView("trading")} onCasino={() => setView("casino")} onRules={() => setView("rules")} bourseEnabled={bourseEnabled} casinoEnabled={casinoEnabled} isDesktop={isDesktop} currency={currency} onCycleCurrency={cycleCurrency} />
      {multiplayer && <PlayersPanel players={players} currentPlayerIndex={currentPlayerIndex} currency={currency} />}

      <div style={{ ...styles.main, flexDirection: isDesktop ? "row" : "column" }}>
        <div style={{ ...styles.boardCol, minWidth: 0 }}>
          {phase === "fasttrack" ? (
            <FastBoard fastTrack={fastTrack} displayPosition={fastDisplayPosition} dice={dice} diceRolling={diceRolling} onRoll={rollDice} skipTurns={skipTurns} charityTurnsLeft={charityTurnsLeft} isDesktop={isDesktop} pending={!!pendingDecision} moving={moving} locked={boardLocked} lockedLabel={boardLockedLabel} onEndTurn={() => finishTurn()} endTurnReady={endTurnReady} />
          ) : (
            <RatBoard position={displayPosition} dice={dice} diceRolling={diceRolling} onRoll={rollDice} skipTurns={skipTurns} charityTurnsLeft={charityTurnsLeft} isDesktop={isDesktop} pending={!!pendingDecision} moving={moving} locked={boardLocked} lockedLabel={boardLockedLabel} onEndTurn={() => finishTurn()} endTurnReady={endTurnReady} />
          )}
          {lastEvent && <EventBanner event={lastEvent} />}
        </div>

        <div style={{ ...styles.ledgerCol, width: isDesktop ? 360 : "100%", maxWidth: isDesktop ? 360 : "100%" }}>
          {phase === "fasttrack" ? (
            <FastLedger fastTrack={fastTrack} currency={currency} />
          ) : (
            <Ledger profession={profession} cash={cash} kids={kids} assets={assets} liabilities={liabilities} extraDebtBalance={extraDebtBalance} extraMonthly={extraMonthly} bankLoanBalance={bankLoanBalance} onTakeBankLoan={takeBankLoan} onRepayBankLoan={repayBankLoan} passiveIncome={passiveIncome} totalExpenses={totalExpenses} totalIncome={totalIncome} netCashflow={netCashflow} currency={currency} tokens={tokens} portfolio={portfolio} onOpenAssets={() => setView("assets")} onOpenDebts={() => setView("debts")} />
          )}
        </div>
      </div>
      {pendingDecision && (
        <div style={isAiTurn ? { pointerEvents: "none" } : undefined}>
        <DecisionModal
          decision={pendingDecision}
          cash={cash}
          fastCash={fastTrack ? fastTrack.fastCash : 0}
          currency={currency}
          downPaymentPct={downPaymentPct}
          financingMode={financingMode}
          yieldMode={yieldMode}
          customYieldMultiplier={customYieldMultiplier}
          loanRateMult={marketTurn < economicModifier.expiresTurn ? economicModifier.loanRateMult : 1}
          debtRatioEnabled={debtRatioEnabled}
          currentDebtPayments={currentDebtPayments}
          totalIncome={totalIncome}
          onBuy={buyAsset}
          onSkip={skipAsset}
          onMarket={resolveMarketSell}
          onCharity={resolveCharity}
          onDoodadCash={payDoodadCash}
          onDoodadFinance={financeDoodad}
          onBuyFast={buyFastBusiness}
          onSkipFast={skipFastBusiness}
          onCharityFast={resolveFastCharity}
        />
        </div>
      )}
    </div>
  );
}
