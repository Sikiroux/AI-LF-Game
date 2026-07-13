import useRatRace2State from "./state/useRatRace2State.js";
import LoadingScreen from "../../components/screens/LoadingScreen.jsx";
import RatRace2MenuScreen from "./components/screens/RatRace2MenuScreen.jsx";
import MonthHub from "./components/hub/MonthHub.jsx";

export default function RatRace2App({ onExitHome }) {
  const { loaded, view, setView, day, cash, hasSave, startGame, resetGame, nextDay } = useRatRace2State();

  if (!loaded) return <LoadingScreen />;
  if (view === "menu") {
    return <RatRace2MenuScreen hasSave={hasSave} onResume={() => setView("game")} onNew={startGame} onExitHome={onExitHome} />;
  }
  return <MonthHub day={day} cash={cash} currency="EUR" onNextDay={nextDay} onMenu={() => setView("menu")} />;
}
