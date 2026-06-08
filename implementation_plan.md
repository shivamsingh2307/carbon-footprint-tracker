# Carbon Footprint Awareness Platform

Build a premium, accessible web application that helps individuals understand, track, and reduce their carbon footprint through personalized activity tracking, rich data visualizations, actionable insights, and gamification.

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Build Tool | **Vite 6** | Fast HMR, native ES modules, zero-config |
| Language | **Vanilla JavaScript (ES2022+)** | No framework overhead, clean modular code |
| Styling | **Vanilla CSS** with custom properties | Full control, CSS variables for theming |
| Charts | **Chart.js 4** (via CDN/npm) | Lightweight, accessible canvas charts |
| Testing | **Vitest** | Vite-native, fast unit/integration tests |
| Storage | **localStorage** with encryption wrapper | Offline-first, no backend dependency |
| Fonts | **Google Fonts (Inter)** | Modern, highly readable |

## Architecture

```
carbon-footprint-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── icons/                  # SVG icons (inline)
│   ├── components/
│   │   ├── Dashboard.js            # Main dashboard view
│   │   ├── ActivityLogger.js       # Log new activities
│   │   ├── InsightsPanel.js        # Personalized tips
│   │   ├── GoalsTracker.js         # Set & track goals
│   │   ├── AchievementsBadges.js   # Gamification badges
│   │   ├── ChartManager.js         # Chart.js wrapper
│   │   ├── Navigation.js           # Tab navigation
│   │   ├── Modal.js                # Accessible modal
│   │   ├── Toast.js                # Notification toasts
│   │   └── ThemeToggle.js          # Dark/light mode
│   ├── data/
│   │   └── emissionFactors.js      # CO₂e factors per activity
│   ├── services/
│   │   ├── StorageService.js       # localStorage CRUD with validation
│   │   ├── CalculatorService.js    # Emission calculations
│   │   ├── InsightsEngine.js       # Personalized insight generation
│   │   └── ExportService.js        # CSV/JSON data export
│   ├── utils/
│   │   ├── sanitize.js             # XSS prevention / input sanitization
│   │   ├── validators.js           # Input validation functions
│   │   ├── formatters.js           # Number/date formatting
│   │   ├── accessibility.js        # Focus traps, announcements
│   │   └── constants.js            # App-wide constants
│   ├── styles/
│   │   ├── variables.css           # Design tokens (colors, spacing, etc.)
│   │   ├── base.css                # Reset, typography, global styles
│   │   ├── components.css          # Component-specific styles
│   │   ├── animations.css          # Keyframe animations
│   │   ├── accessibility.css       # Focus styles, reduced-motion
│   │   └── responsive.css          # Breakpoints and responsive layout
│   ├── app.js                      # App initialization & routing
│   └── main.js                     # Entry point
├── tests/
│   ├── calculator.test.js          # Calculator unit tests
│   ├── storage.test.js             # Storage service tests
│   ├── sanitize.test.js            # Sanitization tests
│   ├── validators.test.js          # Validation tests
│   └── insights.test.js            # Insights engine tests
├── index.html                      # Root HTML
├── package.json
├── vite.config.js
└── README.md
```

---

## Proposed Changes

### 1. Project Scaffolding & Configuration

#### [NEW] package.json
- Vite 6, Chart.js 4, Vitest as devDependency
- Scripts: `dev`, `build`, `preview`, `test`, `test:coverage`

#### [NEW] vite.config.js
- Configure Vitest inline
- Set CSP headers in dev server config

#### [NEW] index.html
- Semantic HTML5 structure with `<header>`, `<nav>`, `<main>`, `<footer>`
- `lang="en"`, proper `<meta>` tags (viewport, description, charset)
- Skip-to-content link for accessibility
- `<script type="module" src="/src/main.js">`
- CSP meta tag for security

---

### 2. Design System (CSS)

#### [NEW] src/styles/variables.css
Design tokens using CSS custom properties:
- **Colors**: Rich emerald/teal palette for eco-theme, with full dark mode palette
- **Spacing**: 4px-based scale (--space-1 through --space-12)
- **Typography**: Inter font, modular type scale
- **Shadows**: Layered elevation system (sm, md, lg, xl)
- **Radii**: Consistent border-radius tokens
- **Transitions**: Standardized easing and durations

#### [NEW] src/styles/base.css
- Modern CSS reset (box-sizing, margin reset, smooth scrolling)
- Typography defaults with Inter
- Semantic element styling

#### [NEW] src/styles/components.css
- Card components with glassmorphism (`backdrop-filter: blur`)
- Buttons: primary (gradient), secondary (outline), ghost
- Form inputs with floating labels
- Progress bars and stat cards
- Badge components for achievements

#### [NEW] src/styles/animations.css
- `@keyframes fadeIn`, `slideUp`, `scaleIn`, `pulse`, `shimmer`
- Entry animations for cards and modals
- Number counting animation via CSS counters
- Staggered animation delays for lists

#### [NEW] src/styles/accessibility.css
- `:focus-visible` outlines on all interactive elements
- `prefers-reduced-motion` media query disabling animations
- `prefers-color-scheme` auto-detection
- `prefers-contrast` high contrast mode support
- Screen reader only class (`.sr-only`)

#### [NEW] src/styles/responsive.css
- Mobile-first breakpoints: 480px, 768px, 1024px, 1280px
- Responsive grid layouts
- Collapsible navigation on mobile

---

### 3. Data Layer

#### [NEW] src/data/emissionFactors.js
Emission factors (kg CO₂e) organized by category:

| Category | Activities | Source |
|----------|-----------|--------|
| **Transport** | Car (per km by fuel type), bus, train, bicycle, walking, flight (short/long haul) | EPA, DEFRA |
| **Food** | Meal types (vegan, vegetarian, mixed, high-meat), individual items (beef, chicken, etc.) | Our World in Data |
| **Energy** | Electricity (per kWh), natural gas, heating oil, solar | EPA |
| **Home** | Shower duration, laundry, dishwasher, heating/cooling | Various |
| **Shopping** | Clothing, electronics, general goods | DEFRA |
| **Waste** | Recycling, landfill, composting | EPA |

Each factor includes: `id`, `category`, `name`, `unit`, `co2ePerUnit`, `icon`, `description`

---

### 4. Services (Business Logic)

#### [NEW] src/services/StorageService.js
- CRUD operations on localStorage with JSON schema validation
- Data versioning with migration support
- Automatic data integrity checks
- Size limit warnings (approaching 5MB localStorage limit)
- Export/import functionality for data portability

#### [NEW] src/services/CalculatorService.js
- `calculateEmission(activityId, quantity)` → kg CO₂e
- `getDailyTotal(date)`, `getWeeklyTotal()`, `getMonthlyTotal()`
- `getCategoryBreakdown(period)` → { transport: X, food: Y, ... }
- `getComparisonToAverage()` → comparison against national/global averages
- `getTrendData(period)` → time-series data for charts
- All calculations use immutable data patterns and pure functions

#### [NEW] src/services/InsightsEngine.js
- Analyzes user activity patterns to generate personalized tips
- Identifies highest-impact reduction opportunities
- Generates contextual suggestions (e.g., "Switching 2 car trips/week to cycling would save X kg CO₂e/year")
- Streak detection for consistent eco-friendly behaviors
- Weekly/monthly progress summaries

#### [NEW] src/services/ExportService.js
- Export data as CSV or JSON
- Data anonymization option
- Blob-based download (no server needed)

---

### 5. Utility Functions

#### [NEW] src/utils/sanitize.js
- `sanitizeHTML(input)` — Escapes `<>&"'` to prevent XSS
- `sanitizeInput(input, type)` — Type-aware sanitization (number, text, date)
- Uses allowlisting approach, not blocklisting

#### [NEW] src/utils/validators.js
- `validateActivity(data)` — Schema validation for activity entries
- `validateGoal(data)` — Goal data validation
- `isValidDate(date)`, `isPositiveNumber(n)`
- Returns structured error objects `{ valid: boolean, errors: string[] }`

#### [NEW] src/utils/formatters.js
- `formatCO2(kg)` — Displays in kg or tons with appropriate precision
- `formatDate(date, format)` — Locale-aware date formatting
- `formatPercentage(value)` — Percentage with sign indicator
- `formatRelativeTime(date)` — "2 days ago" style formatting

#### [NEW] src/utils/accessibility.js
- `trapFocus(element)` — Focus trap for modals
- `announceToScreenReader(message)` — Live region announcements
- `generateId(prefix)` — Unique ARIA IDs
- `handleKeyboardNav(event)` — Arrow key navigation for custom widgets

#### [NEW] src/utils/constants.js
- App version, storage keys, category enums
- Average footprint benchmarks (global, US, EU)
- Achievement thresholds and badge definitions

---

### 6. UI Components

#### [NEW] src/components/Navigation.js
- Tab-based SPA navigation with `role="tablist"` / `role="tab"` ARIA pattern
- Keyboard navigable (arrow keys, Home/End)
- Active tab indicator with smooth sliding animation
- Mobile hamburger menu with animated transition
- Icons + labels for each section

#### [NEW] src/components/Dashboard.js
**Hero Section:**
- Animated counter showing total CO₂e saved/emitted
- Ring/donut chart showing category breakdown (Chart.js)
- Comparison gauge: "You vs. Average"

**Stats Grid:**
- Today's emissions with trend indicator (↑↓)
- Weekly streak counter
- Best day indicator
- Carbon equivalency display ("= X trees needed to offset")

**Recent Activity Feed:**
- Last 5 logged activities with icons and relative timestamps
- Quick-delete with confirmation

**Trend Chart:**
- 7-day / 30-day / 90-day toggle
- Line chart with gradient fill (Chart.js)
- Hover tooltips with detailed data

#### [NEW] src/components/ActivityLogger.js
- Category selection with icon cards (tap/click to select)
- Dynamic sub-activity dropdown based on category
- Quantity input with unit label (km, kWh, servings, etc.)
- Date picker (defaults to today)
- Notes field (optional)
- Real-time CO₂e preview as user inputs data
- Form validation with inline error messages
- Success toast on submission with undo option

#### [NEW] src/components/InsightsPanel.js
- Personalized tips based on activity data
- Impact comparison cards ("Equivalent to X smartphone charges")
- Weekly summary with progress arrows
- "Did you know?" eco-fact carousel
- Suggestion cards with estimated savings

#### [NEW] src/components/GoalsTracker.js
- Preset goals (reduce by 10%, 25%, 50%) + custom goal
- Progress bar with milestone markers
- Countdown to goal deadline
- Historical goal completion display

#### [NEW] src/components/AchievementsBadges.js
- Badge grid with locked/unlocked states
- Categories: Streak, Reduction, Exploration, Impact
- Pop-up animation on unlock
- Progress indicators for locked badges
- Share badge capability (copy to clipboard)

#### [NEW] src/components/Modal.js
- Accessible modal with focus trap
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Escape key to close, click-outside to close
- Animated entry/exit transitions
- Prevents background scroll

#### [NEW] src/components/Toast.js
- Non-intrusive notifications
- `role="status"`, `aria-live="polite"`
- Auto-dismiss with progress indicator
- Stacking for multiple toasts
- Action button support (e.g., "Undo")

#### [NEW] src/components/ThemeToggle.js
- Dark/light mode toggle with system preference detection
- Smooth color transitions
- Persists preference to localStorage
- Sun/moon icon animation

---

### 7. App Core

#### [NEW] src/app.js
- Client-side routing via hash-based navigation
- Component lifecycle management (mount/unmount/update)
- Global event bus for inter-component communication
- Error boundary with user-friendly error display

#### [NEW] src/main.js
- App initialization
- Theme detection and application
- Service worker registration (if applicable)
- Global error handler with `window.onerror`

---

### 8. Tests

#### [NEW] tests/calculator.test.js
- Unit tests for all emission calculations
- Edge cases: zero values, extremely large values, negative inputs
- Category breakdown accuracy
- Trend calculation correctness

#### [NEW] tests/storage.test.js
- CRUD operations
- Data migration between versions
- Storage limit handling
- Invalid data rejection

#### [NEW] tests/sanitize.test.js
- XSS attack vector prevention (`<script>`, event handlers, etc.)
- Unicode handling
- Empty/null input handling

#### [NEW] tests/validators.test.js
- Valid/invalid activity data
- Boundary value testing
- Type coercion handling

#### [NEW] tests/insights.test.js
- Insight generation with various activity patterns
- Edge case: no data, single entry, long history

---

## Security Measures

| Measure | Implementation |
|---------|---------------|
| **XSS Prevention** | All user input sanitized before DOM insertion via `sanitize.js`; never use `innerHTML` with raw input |
| **Input Validation** | All form inputs validated on both entry and retrieval from storage |
| **CSP Headers** | Content Security Policy meta tag restricting script/style sources |
| **No eval()** | Zero use of `eval()`, `Function()`, or `innerHTML` with untrusted data |
| **Data Integrity** | JSON schema validation on all stored data; corrupt data detected and quarantined |
| **Dependency Security** | Minimal dependencies (only Chart.js + Vite/Vitest); each reviewed |
| **HTTPS Ready** | All external resources loaded via HTTPS |

---

## Accessibility (WCAG 2.1 AA)

| Feature | Implementation |
|---------|---------------|
| **Semantic HTML** | Proper heading hierarchy (`h1`→`h2`→`h3`), landmarks (`nav`, `main`, `aside`) |
| **Keyboard Navigation** | Full keyboard operability; visible focus indicators; skip links |
| **Screen Reader** | ARIA roles, labels, live regions for dynamic content |
| **Color Contrast** | All text meets 4.5:1 (AA) minimum; interactive elements meet 3:1 |
| **Reduced Motion** | `prefers-reduced-motion` disables all animations |
| **Color Independence** | No information conveyed by color alone; icons + text + patterns |
| **Focus Management** | Focus trapped in modals; restored on close |
| **Error Messages** | Linked to inputs via `aria-describedby` |
| **Responsive Text** | `rem`/`em` units; respects browser font size settings |

---

## Premium UI Design

### Color Palette
- **Primary**: Emerald gradient (`#059669` → `#10B981`)
- **Accent**: Amber/gold for achievements (`#F59E0B`)
- **Dark Mode**: Rich charcoal backgrounds (`#0F172A`, `#1E293B`) with emerald accents
- **Light Mode**: Clean whites (`#FAFAFA`) with subtle gray cards
- **Semantic**: Green (good), amber (warning), red (high emissions)

### Visual Effects
- Glassmorphism cards with `backdrop-filter: blur(12px)` + semi-transparent backgrounds
- Gradient borders on hover
- Smooth 300ms transitions on all interactive elements
- Subtle parallax on dashboard hero
- Animated SVG icons
- Shimmer loading states
- Staggered fade-in for list items

### Typography
- **Inter** (Google Fonts) — clean, modern, highly readable
- Modular type scale: 0.75rem → 3rem
- Font weight variety: 400 (body), 500 (labels), 600 (headings), 700 (hero)

---

## Verification Plan

### Automated Tests
```bash
npm run test          # Run all Vitest tests
npm run test:coverage # Run with coverage report
npm run build         # Verify production build succeeds
```

### Manual Verification
- Visual inspection of all views in light/dark mode
- Keyboard-only navigation through entire app
- Browser DevTools Lighthouse audit (Performance, Accessibility, Best Practices)
- Test with `prefers-reduced-motion: reduce` enabled
- Verify all forms reject invalid/malicious input
- Test localStorage persistence across page reloads
- Responsive testing at 320px, 768px, 1024px, 1440px breakpoints

---

## Open Questions

> [!IMPORTANT]
> **Data Persistence**: The plan uses `localStorage` for offline-first data storage. This means data is browser-specific and limited to ~5MB. Is this acceptable, or would you like a backend (e.g., Firebase) for cross-device sync?

> [!NOTE]
> **Chart Library**: I've chosen **Chart.js** for data visualization since it's lightweight (~60KB gzipped), well-documented, and has built-in accessibility features. An alternative would be D3.js (more powerful but heavier) or a fully custom SVG/Canvas solution. Any preference?

> [!NOTE]
> **Scope**: The plan includes gamification (achievements/badges), goal tracking, CSV export, and personalized insights. Should I prioritize any features, or are all equally important?
