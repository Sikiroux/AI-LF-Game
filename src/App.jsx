import { useState } from "react";
import HomeScreen from "./components/screens/HomeScreen.jsx";
import ClassicApp from "./ClassicApp.jsx";
import RatRace2App from "./modes/ratrace2/RatRace2App.jsx";

export default function App() {
  const [mode, setMode] = useState(null); // null | "classic" | "ratrace2"

  if (mode === "classic") return <ClassicApp onExitHome={() => setMode(null)} />;
  if (mode === "ratrace2") return <RatRace2App onExitHome={() => setMode(null)} />;
  return <HomeScreen onSelectClassic={() => setMode("classic")} onSelectRatRace2={() => setMode("ratrace2")} />;
}
