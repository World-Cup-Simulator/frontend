# AGENTS.md - Frontend Context & Guidelines

## Quick Start

```bash
# Add a new dependency to the project
bun add [package-name]

# Run the development server (Vite)
bun run dev

# Build the application for production (Typecheck + Build)
bun run build

# Preview the production build locally
bun run preview

# Run ESLint to check code quality
bun run lint
```

## Project Overview & Tech Stack

This is the frontend application for the World Cup Simulator (WCS). It connects to a backend developed in .NET 9 (Clean Architecture + PostgreSQL).

| Layer | Technology |
|---|---|
| Core | React 19.2.x (Functional Components) + TypeScript 6.0.x |
| Build Tool & Runtime | Vite 8.x + Bun |
| Compiler Optimizations | React Compiler (Babel Plugin v1.0.0) |
| HTTP Client | Axios 1.17.x (Strictly typed with TypeScript) |
| Styles | Tailwind CSS 4.3.x (via @tailwindcss/vite plugin) |

> **Note:** React Compiler handles memoization automatically. Do **not** use `useMemo` or `useCallback` manually unless strictly necessary.

---

## Architecture & Solution Layout (Feature-Driven Clean Architecture)

The project follows a modular structure oriented around **Features** and **Shared** elements, ensuring low coupling and high cohesion.

```
src/
├── app/                  # Global configuration, providers, and routing
│   ├── layout/           # Base page structures (Navbar, Sidebar, etc.)
│   ├── routes/           # Application route definitions
│   └── pages/            # View/screen components mapped to routes
├── assets/               # Global static assets (images, fonts)
├── features/             # Independent business modules (verticals)
│   ├── [feature_name]/   # Example: groups, matches, teams
│   │   ├── components/   # Exclusive components for this feature
│   │   ├── hooks/        # Custom hooks with local business logic
│   │   ├── models/       # TS interfaces and types specific to this domain
│   │   └── services/     # Axios API clients specific to this feature
├── shared/               # Reusable code across any feature (horizontals)
│   ├── components/       # Generic and atomic UI components (Buttons, Modals, Inputs)
│   ├── hooks/            # Global custom hooks (useAuth, useFetch, etc.)
│   ├── models/           # Global or shared TypeScript types (e.g., API Responses)
│   ├── services/         # Configured Axios client (Base instance, interceptors)
│   └── utils/            # Pure utility functions and mathematical helpers
├── App.tsx               # Root component with global providers
└── main.tsx              # React initialization
```

---

## Architectural & Coding Rules

### 1. Robustness and Algorithm Design

- **Edge Cases:** Proactively identify and handle loading states, empty states, invalid inputs, and unexpected API responses.
- **Algorithmic Complexity:** Design efficient functions. Avoid deeply nested logic. Do not exceed a maximum time complexity of `O(n log n)` for data processing. Prioritize simpler and faster granular solutions like `O(1)` or `O(n)` using appropriate data structures (`Map`, `Set`) when processing tournament or simulator collections.
- **Security:** Rigorously sanitize and validate user inputs in forms before passing them to Axios to prevent injections or corrupted client states.

### 2. SOLID Principles and Clean Design

- **Single Responsibility Principle (SRP):** A component should only handle UI presentation or delegation. Complex state logic or side effects must be extracted into Custom Hooks. Services must only handle HTTP communication.
- **Early Returns:** Minimize nesting by utilizing early returns in functions and components to maximize readability.
- **Small Functions:** Extract logic into pure, small, and reusable functions outside the component body whenever possible.

### 3. Strict TypeScript

- **No `any` allowed:** Everything must be strictly typed.
- **API Mapping:** Every Axios request must be typed using generics based on domain models: `axios.get<UserResponse>('/endpoint')`.
- **Interfaces vs Types:** Use `interface` to define object contracts (especially domain entities coming from the .NET backend) and `type` for unions, aliases, or combinations.

### 4. Interface & Type Isolation Rules
- **No Inline Domain Types:** Do not declare business domain interfaces, data contracts, or component prop types inside the component file itself.
- **Dedicated Models Directory:** Always isolate types and interfaces into dedicated files inside the nearest `models/` folder (e.g., `src/shared/models/tickerTape.ts` or `src/features/simulation/models/simulationTypes.ts`).
- **Naming Conventions:** Use clean `PascalCase` names directly derived from the domain (e.g., `MatchTick`, `TournamentBracket`). **Do not use the legacy "I" prefix** for interfaces (avoid `IMatchTick`).
- **Exposure via Barrels:** Ensure new model files are exported through their local directory's `index.ts` (barrel file) to maintain a clean import hierarchy throughout the codebase.

---

## Conventions

### 1. Naming Conventions (React + TS)

| Element | Convention | Example |
|---|---|---|
| Components & Pages | PascalCase + `.tsx` | `TeamCard.tsx`, `DashboardPage.tsx` |
| Hooks | camelCase starting with `use` | `useMatchSimulation.ts` |
| Services, Utils & Models | camelCase + `.ts` | `matchService.ts`, `teamModels.ts` |
| Variables & Functions | Descriptive camelCase | `currentMatchId`, `calculatePoints()` |

### 2. Tailwind CSS Conventions

- **Class Ordering:** Group utility classes following this standard order:
  1. Layout (`position`, `display`)
  2. Box Model (`size`, `margin`, `padding`)
  3. Typography
  4. Visuals (`bg`, `border`, `shadow`)
  5. Interactive (`hover`, `focus`)

- **Readability:** If a Tailwind class string becomes excessively long, format it across multiple lines or structure it cleanly using logical conditionals.

### 3. Component & Export Standards
- **Arrow Functions:** Strictly use `export const ComponentName = () => {}` for functional components and custom hooks. Avoid using `export default function`.
- **Named Exports:** Always use named exports to ensure strict auto-completion and renaming consistency across the workspace.
- **Barrel Files (index.ts):** Use `index.ts` files at the root of each feature or shared module directory to expose only the necessary public API (components, hooks, or services). Avoid deep importing from internal component files; everything external must go through the module's barrel file.

---

## Configuration & Environment Variables

- The project uses environment variables to define the .NET backend base URL.
- **Local File:** `.env` (ignored in `.gitignore`)
- **Reference File:** `.env.example` (must be kept up to date if new keys are added)
- All Vite environment variables must be prefixed with `VITE_`. Example:

```env
VITE_API_BASE_URL=https://localhost:5000
```

> The Axios client inside `shared/services/` must consume this variable centrally.

## Visual Style Guide

### 1. Theme & Core Colors
- **App Vibe:** Sporting, high-performance, dark-mode first, and ultra-modern premium software aesthetics.
- **Base Background:** `bg-zinc-900` (Main background for full-screen layout).
- **Containers & Cards:** `bg-zinc-800` or `bg-zinc-800/50` with a subtle border (`border border-zinc-700/50`) to create depth and modern layering.
- **Primary Accent (CTA/Interactions):** `bg-indigo-600` or `bg-violet-600` (Hover: `hover:bg-indigo-500`) for primary action buttons like "Predict" or "Simulate".
- **Status Accents:** `text-emerald-400` or `bg-emerald-500/10` for successful predictions, points, or completed match standings. `text-amber-400` for live or pending events.

### 2. Layout, Borders & Spacing
- **Borders:** Strictly use smooth rounded corners. Use `rounded-xl` (12px) for standard cards/widgets and `rounded-2xl` (16px) for larger sections or major group views.
- **Spacing:** Maintain clean breathing room using strict padding structures. Use `p-4` (16px) for inner components and `p-6` (24px) for page sections or parent containers. Avoid cramped layouts by using consistent flex/grid gaps (`gap-4` or `gap-6`).
- **Transitions:** Every interactive state (hovers, active clicks, menu toggles) must feature smooth transitions: `transition-all duration-200 ease-out`.

### 3. Typography & Hierarchy
- **Font Family:** Clean sans-serif system fonts (`font-sans`).
- **Main Titles (Headers/Hero):** `font-bold tracking-tight text-zinc-100` (Using `tracking-tight` delivers that modern, tech-focused look).
- **Subtitles & Card Titles:** `font-semibold text-zinc-200`.
- **Muted Text (Dates/Descriptions):** `text-sm text-zinc-400` to prevent visual noise and establish clear information hierarchy.