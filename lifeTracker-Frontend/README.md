# lifeTracker-Frontend

A lightweight, local-first React + Vite frontend for personal life tracking: health, study, goals, habits, and daily logs with visual analytics and JSON export.

**Tech stack**
- React + TypeScript
- Vite
- Tailwind CSS (utility-first styling)
- date-fns for date handling
- Recharts for charts
- Lucide icons

**What this project is**

lifeTracker-Frontend is the client-side UI for a personal life tracker app. It provides a compact dashboard for daily analytics, tools to record sleep/food/study data, goal and habit management, and the ability to export structured JSON of day or goals data for backups or LLM workflows.

**Key features**
- Daily Analytics: interactive date picker, continuity/trend charts, summary metrics, and per-day JSON export.
- Daily Logs: create and edit daily summaries, sleep logs, study sessions, and quick metrics (day score, LC solved).
- Long-term Goals: create goals, milestones, recurring routines, daily reflections, and goal-specific daily tracking with export.
- Reusable date + export header used across views for consistent UX.
- Study & Skill tracking: record study sessions, aggregate study hours by skill.
- Modular UI components (modules folder) for clean separation of features.
- Local-first data model: app data is stored in-memory (see `src/data/store.ts`) and arranged to be easy to persist or sync.

**Project structure (important files)**
- `src/` — main frontend source
  - `App.tsx`, `main.tsx` — app entry
  - `components/` — UI components and views (Analytics, DailyLogView, GoalsView, modules)
  - `data/` — sample data, types, and store utilities
  - `lib/` — helpers such as `exportHelpers.ts`

**How to run (developer)**
1. Install dependencies
```bash
npm install
```
2. Start dev server
```bash
npm run dev
```
3. Build for production
```bash
npm run build
```

**Export / Backup**
- The app supports exporting selected-day JSON (detailed daily data + summary metrics) and a goals backup JSON via the header Export button.

**Extending / Notes for contributors**
- UI header for date + export is in `src/components/TopDateHeader.tsx` for reuse across views.
- Day export logic is in `src/lib/exportHelpers.ts` and can be extended to include more contexts or formatted exports.
- To persist data, wire `src/data/store.ts` to localStorage or a backend sync API.

If you want, I can also add a short CONTRIBUTING.md, setup GitHub Actions for CI, or update the README with screenshots and usage examples — tell me which you'd like next.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
