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
│   └── routes/           # Application route definitions
├── assets/               # Global static assets (images, fonts)
├── features/             # Independent business modules (verticals)
│   ├── [feature_name]/   # Example: groups, matches, teams
│   │   ├── components/   # Exclusive components for this feature
│   │   ├── hooks/        # Custom hooks with local business logic
│   │   ├── models/       # TS interfaces and types specific to this domain
│   │   ├── pages/        # View/screen components mapped to routes
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
