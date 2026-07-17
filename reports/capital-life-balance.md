# Audit d’équilibrage — Capital Life

Généré le 16/07/2026 18:47:53 avec 1 000 simulations par métier et stratégie, sur 24 mois.

## Périmètre

- Isole la boucle salaire/dépenses/dettes/missions, sans Bourse, OppMarket ni événements aléatoires.
- Les mensualités réduisent le capital après application du taux propre à chaque type de dette.
- Freelance hebdomadaire exécute les trois missions renouvelées chaque semaine.

## Défi : Sortir du piège

| Stratégie | Réussite | Mois médian | Dette finale | Patrimoine final |
|---|---:|---:|---:|---:|
| passive_saver | 0 % | — | 18 447 € | 3 873 € |
| debt_first | 100 % | 22 | 0 € | 4 655 € |
| freelance_weekly | 100 % | 16 | 0 € | 14 031 € |

## Résultats généraux

| Métier | Stratégie | Patrimoine médian | Dette médiane | Sans dette | Mois médian | Revenus freelance |
|---|---|---:|---:|---:|---:|---:|
| Instituteur·rice | passive_saver | 25 042 € | 4 597 € | 4 % | 16 | 0 € |
| Instituteur·rice | debt_first | 25 950 € | 0 € | 100 % | 8 | 0 € |
| Instituteur·rice | freelance_weekly | 38 104 € | 0 € | 100 % | 6 | 12 089 € |
| Infirmier·ère | passive_saver | 31 166 € | 5 160 € | 3 % | 13.5 | 0 € |
| Infirmier·ère | debt_first | 32 190 € | 0 € | 100 % | 8 | 0 € |
| Infirmier·ère | freelance_weekly | 40 377 € | 0 € | 100 % | 6 | 8 141 € |
| Policier·ère | passive_saver | 28 024 € | 3 985 € | 9 % | 15 | 0 € |
| Policier·ère | debt_first | 28 902 € | 0 € | 100 % | 7 | 0 € |
| Policier·ère | freelance_weekly | 40 811 € | 0 € | 100 % | 5 | 11 761 € |
| Secrétaire | passive_saver | 22 172 € | 3 184 € | 9 % | 16 | 0 € |
| Secrétaire | debt_first | 22 960 € | 0 € | 100 % | 7 | 0 € |
| Secrétaire | freelance_weekly | 31 438 € | 0 € | 100 % | 5 | 8 487 € |
| Camionneur·euse | passive_saver | 23 589 € | 3 795 € | 9 % | 16 | 0 € |
| Camionneur·euse | debt_first | 24 338 € | 0 € | 100 % | 8 | 0 € |
| Camionneur·euse | freelance_weekly | 34 333 € | 0 € | 100 % | 6 | 9 873 € |
| Ingénieur·e | passive_saver | 46 849 € | 9 321 € | 3 % | 13.5 | 0 € |
| Ingénieur·e | debt_first | 48 459 € | 0 € | 100 % | 8 | 0 € |
| Ingénieur·e | freelance_weekly | 63 680 € | 0 € | 100 % | 6 | 15 330 € |
| Avocat·e | passive_saver | 66 104 € | 16 074 € | 4 % | 16 | 0 € |
| Avocat·e | debt_first | 68 370 € | 0 € | 100 % | 9 | 0 € |
| Avocat·e | freelance_weekly | 82 252 € | 0 € | 100 % | 8 | 13 814 € |
| Médecin | passive_saver | 105 931 € | 30 681 € | 4 % | 14.5 | 0 € |
| Médecin | debt_first | 108 836 € | 0 € | 100 % | 10 | 0 € |
| Médecin | freelance_weekly | 122 297 € | 0 € | 100 % | 9 | 13 403 € |

## Lecture initiale

- Une stratégie est suspecte si elle domine presque tous les métiers sans contrepartie de risque, de temps ou de compétence.
- Les mensualités persistantes signalent les dettes dont la durée dépasse la fenêtre de 24 mois.
- Le freelance hebdomadaire mesure le plafond provisoire du bouton de mission, avant la future simulation de contrats.
