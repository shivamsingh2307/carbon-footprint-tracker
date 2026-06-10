# EcoTrack — Carbon Footprint Awareness Platform

EcoTrack is a client-side web application that helps individuals understand, track, and reduce their personal carbon footprint. Users log everyday activities—transport, food, energy, and more—and the app converts those entries into CO₂ equivalent (CO₂e) estimates, visualizes trends over time, and surfaces actionable recommendations to support more sustainable habits.

---

## Chosen Vertical

**Individual sustainability and carbon footprint awareness.**

The project targets people who want a practical, low-friction way to build environmental literacy without needing specialized hardware, utility integrations, or a backend account system. Rather than measuring emissions at the source (smart meters, vehicle telematics, etc.), EcoTrack focuses on **self-reported activity tracking** paired with published emission factors—a common approach for personal carbon calculators and awareness tools.

The vertical emphasizes three outcomes:

- **Awareness** — making abstract climate impact tangible through daily totals, benchmarks, and equivalencies (e.g. trees needed to offset emissions)
- **Behavior change** — goals, streaks, and personalized insights that suggest concrete next steps
- **Engagement** — gamification through badges and progress tracking to encourage consistent logging

---

## Approach and Logic

### Design philosophy

EcoTrack is built as an **offline-first, privacy-friendly SPA** with no server dependency. All user data stays in the browser via `localStorage`, which keeps the scope focused on individual use and avoids authentication, sync, or infrastructure complexity.

The logic follows a simple pipeline:

```
User activity + quantity → emission factor lookup → CO₂e calculation → aggregation & analytics → UI / insights / goals
```

### Technical approach

| Decision | Rationale |
|----------|-----------|
| **Vanilla JavaScript (ES modules)** | Keeps the codebase lightweight and readable without framework overhead |
| **Vite** | Fast dev server, native ESM, and straightforward production builds |
| **Modular services layer** | Separates storage, calculation, insights, and export concerns for testability |
| **Static emission factor database** | Predefined CO₂e values per activity type, sourced from public references (EPA, DEFRA, IEA, Our World in Data) |
| **Rule-based insights engine** | Analyzes logged patterns and generates tips from heuristics rather than ML models |
| **Chart.js (lazy-loaded)** | Visualizes category breakdown and trends without blocking app startup |

### Calculation logic

For each logged activity:

```
emission (kg CO₂e) = quantity × co2ePerUnit
```

Aggregations (daily totals, period totals, category breakdown, streaks, benchmarks) are derived from stored activities using pure functions in `CalculatorService`. Insights in `InsightsEngine` inspect category dominance, transport and food patterns, streaks, and comparison against regional/global daily averages.

---

## How the Solution Works

### Application structure

EcoTrack is a hash-routed single-page app with five main views:

| View | Purpose |
|------|---------|
| **Dashboard** | Summary stats, category doughnut chart, emission trend line chart, recent activity feed |
| **Log Activity** | Form to record activities across six categories with live emission preview |
| **Insights** | Personalized reduction tips, benchmark comparisons, eco facts, CSV/JSON export |
| **Goals** | Set percentage-reduction targets with deadlines and progress tracking |
| **Badges** | Achievement system for streaks, logging volume, reductions, and impact milestones |

### Data flow

1. **Log** — User selects a category, activity type, quantity, and date. Input is validated and sanitized before storage.
2. **Calculate** — `CalculatorService` applies the matching factor from `emissionFactors.js` and stores the computed CO₂e with the entry.
3. **Persist** — `StorageService` reads/writes activities, goals, achievements, and settings to `localStorage`.
4. **Analyze** — Dashboard charts and the insights engine consume aggregated data for the selected time window (7 / 30 / 90 days).
5. **Motivate** — Goals track progress against a baseline; `AchievementService` unlocks badges and shows toast notifications.

### Running the project

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default: `http://localhost:3000`).

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # preview production build
npm test         # run Vitest unit tests
```

> **Note:** The app must be served through Vite (or another dev server). Opening `index.html` directly in the browser will not resolve module imports correctly.

---

## Assumptions

The following assumptions shape the design and should be understood when interpreting results:

### Emission estimates

- **Average factors, not personal measurements.** Emission values use published averages (e.g. average petrol car per km, average grid electricity mix). Actual emissions vary by vehicle efficiency, energy provider, season, and region.
- **CO₂ equivalent (CO₂e).** All figures represent CO₂e, which includes other greenhouse gases converted to a common unit.
- **Self-reported data.** Accuracy depends on user input; the app does not verify quantities or activity types.
- **Simplified activity catalog.** The factor database covers representative activities per category, not an exhaustive list of every possible emission source.

### Benchmarks and goals

- **Regional averages are illustrative.** Global (~11 kg/day), US (~44.4 kg/day), and EU (~17.8 kg/day) benchmarks are approximate daily per-capita figures used for comparison, not precise personal targets.
- **Goal baseline uses a fixed reference.** Progress toward reduction goals is measured against a static EU-average baseline (17.8 kg CO₂e/day), not the user's historical average.
- **Equivalencies are rough.** Conversions such as "trees needed to offset" use simplified absorption estimates (~22 kg CO₂/tree/year) for communication, not carbon accounting.

### Product and scope

- **Single-user, single-browser.** Data is stored locally with no cloud sync, multi-device support, or account recovery if storage is cleared.
- **No backend or authentication.** There is no server-side validation, sharing, or team/organization features.
- **Offline-first with browser storage limits.** `localStorage` capacity is finite; the app caps stored entries and warns as storage grows.
- **Insights are heuristic, not predictive.** Recommendations are rule-based suggestions derived from logged patterns, not personalized life-cycle assessments or certified offset calculations.
- **English-only UI** with date/number formatting that follows the user's browser locale where supported.

---

## Tech Stack

- **Vite 6** — build tool and dev server
- **Vanilla JavaScript (ES2022+)** — application logic
- **Chart.js 4** — charts (loaded on demand)
- **Vitest** — unit tests
- **CSS custom properties** — theming (dark/light mode)

---

## License

Private project — see repository owner for usage terms.
