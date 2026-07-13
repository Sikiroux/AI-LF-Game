import useRatRace2State from "./state/useRatRace2State.js";
import LoadingScreen from "../../components/screens/LoadingScreen.jsx";
import RatRace2MenuScreen from "./components/screens/RatRace2MenuScreen.jsx";
import ScenarioScreen from "./components/screens/ScenarioScreen.jsx";
import MonthHub from "./components/hub/MonthHub.jsx";

export default function RatRace2App({ onExitHome }) {
  const {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debt, hasSave, resetGame, nextDay,
  } = useRatRace2State();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") {
    return <RatRace2MenuScreen hasSave={hasSave} onResume={() => setView("game")} onNew={goToNewScenario} onExitHome={onExitHome} />;
  }
  if (view === "scenario") {
    return <ScenarioScreen scenario={scenarioDraft} currency="EUR" onStart={startGame} onReroll={rerollScenario} onBack={() => setView("menu")} />;
  }
  return <MonthHub day={day} cash={cash} profession={profession} debt={debt} currency="EUR" onNextDay={nextDay} onMenu={() => setView("menu")} />;
}
