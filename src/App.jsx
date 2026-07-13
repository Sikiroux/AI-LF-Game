import { useState } from "react";
import HomeScreen from "./components/screens/HomeScreen.jsx";
import ClassicApp from "./ClassicApp.jsx";
import CapitalLifeApp from "./modes/capitallife/CapitalLifeApp.jsx";

export default function App() {
  const [mode, setMode] = useState(null); // null | "classic" | "capitallife"

  if (mode === "classic") return <ClassicApp onExitHome={() => setMode(null)} />;
  if (mode === "capitallife") return <CapitalLifeApp onExitHome={() => setMode(null)} />;
  return <HomeScreen onSelectClassic={() => setMode("classic")} onSelectCapitalLife={() => setMode("capitallife")} />;
}
