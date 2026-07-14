// Liste générique de compétences professionnelles, communes aux métiers,
// aux missions freelance et à la fondation d'entreprise en Capital Life.
// Un métier donne des compétences de départ ; les postes du "job board" et
// les missions freelance exigent des seuils sur un sous-ensemble de cette
// liste — voir engine/career.js.
export const SKILLS = [
  { key: "communication", label: "Communication" },
  { key: "organisation", label: "Organisation" },
  { key: "informatique", label: "Informatique" },
  { key: "comptabilite", label: "Comptabilité" },
  { key: "vente", label: "Vente / Négociation" },
  { key: "leadership", label: "Leadership" },
  { key: "service_client", label: "Service client" },
  { key: "technique", label: "Technique / Manuel" },
  { key: "analyse", label: "Analyse" },
  { key: "droit", label: "Droit" },
  { key: "sante", label: "Santé / Soin" },
  { key: "securite", label: "Sécurité / Rigueur" },
];

export const SKILL_LABELS = Object.fromEntries(SKILLS.map((s) => [s.key, s.label]));
