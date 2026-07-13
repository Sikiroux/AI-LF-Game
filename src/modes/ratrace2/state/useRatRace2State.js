import { useState, useEffect } from "react";
import { storage } from "../../../state/storage.js";

const SAVE_KEY = "ratrace2-save";

export default function useRatRace2State() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | game
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(SAVE_KEY);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.day) setDay(s.day);
          if (s.cash != null) setCash(s.cash);
        }
      } catch (e) { /* pas de sauvegarde existante */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || day === 0) return;
    storage.set(SAVE_KEY, JSON.stringify({ day, cash })).catch(() => {});
  }, [loaded, day, cash]);

  const hasSave = loaded && day > 0;

  function startGame() {
    setDay(1);
    setCash(2000);
    setView("game");
  }

  function resetGame() {
    storage.delete(SAVE_KEY).catch(() => {});
    setDay(0);
    setCash(0);
    setView("menu");
  }

  function nextDay() {
    setDay((d) => d + 1);
  }

  return { loaded, view, setView, day, cash, hasSave, startGame, resetGame, nextDay };
}
