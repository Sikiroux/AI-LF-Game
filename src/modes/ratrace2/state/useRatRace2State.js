import { useState, useEffect } from "react";
import { storage } from "../../../state/storage.js";
import { calcExpenses } from "../../../engine/financing.js";
import { generateScenario } from "../data/scenarioGenerator.js";

const SAVE_KEY = "ratrace2-save";

export default function useRatRace2State() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("menu"); // menu | scenario | game
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [profession, setProfession] = useState(null);
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(0);
  const [debt, setDebt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(SAVE_KEY);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.day) setDay(s.day);
          if (s.cash != null) setCash(s.cash);
          if (s.profession) setProfession(s.profession);
          if (s.debt !== undefined) setDebt(s.debt);
        }
      } catch (e) { /* pas de sauvegarde existante */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || day === 0) return;
    storage.set(SAVE_KEY, JSON.stringify({ day, cash, profession, debt })).catch(() => {});
  }, [loaded, day, cash, profession, debt]);

  const hasSave = loaded && day > 0;

  function goToNewScenario() {
    setScenarioDraft(generateScenario());
    setView("scenario");
  }

  function rerollScenario() {
    setScenarioDraft(generateScenario());
  }

  function startGame() {
    setProfession(scenarioDraft.profession);
    setCash(scenarioDraft.startingCash);
    setDebt(scenarioDraft.debt);
    setDay(1);
    setView("game");
  }

  function resetGame() {
    storage.delete(SAVE_KEY).catch(() => {});
    setDay(0);
    setCash(0);
    setProfession(null);
    setDebt(null);
    setView("menu");
  }

  // Fait avancer d'un jour. Le salaire n'est versé qu'au premier jour de chaque
  // mois (tous les 30 jours) — le reste du temps, seule la date avance.
  function nextDay() {
    setDay((d) => {
      const nd = d + 1;
      if ((nd - 1) % 30 === 0) {
        const expenses = calcExpenses(profession, 0, 0) + (debt ? debt.monthlyPayment : 0);
        const netCashflow = profession.salary - expenses;
        setCash((c) => c + netCashflow);
        setDebt((deb) => {
          if (!deb) return deb;
          const monthsRemaining = deb.monthsRemaining - 1;
          if (monthsRemaining <= 0) return null;
          return { ...deb, monthsRemaining, balance: deb.monthlyPayment * monthsRemaining };
        });
      }
      return nd;
    });
  }

  return {
    loaded, view, setView,
    scenarioDraft, goToNewScenario, rerollScenario, startGame,
    profession, day, cash, debt, hasSave, resetGame, nextDay,
  };
}
