## Purpose
This file gives an AI assistant the minimal, high-value context to be productive in this repository (a fork of OWASP Juice Shop).

Keep instructions focused and actionable: mention entrypoints, build/test commands, conventions, and pattern examples.

## Big picture
- Backend: TypeScript Express app. Entrypoints:
  - `app.ts` (bootloader — validates deps then starts `server.start()`)
  - `server.ts` (configures the Express app, middleware, routes and starts HTTP server)
- Frontend: Angular app in `frontend/` (built with `ng build`).
- Data & models: `models/` (Sequelize models) and `data/` (datacreator, static data).
- Routes: `routes/` contains one-file-per-route modules wired in `server.ts`.

Architecture notes: The backend is compiled with `tsc` to `build/` and can be run from `build/app` or run directly with `ts-node` in dev. The project purposely contains insecure/vulnerable code for CTF-style challenges — DO NOT “fix” those unless the task is explicitly to remove/patch a challenge.

## How to run (common workflows)
- Install and build (project root): `npm install` (postinstall handles frontend build)
- Dev (hot reload backend + frontend): `npm run serve:dev` — runs `ts-node-dev app.ts` and `ng serve` concurrently. This is the typical local dev loop.
- Prod-like local run: `npm run serve` runs compiled frontend and `ts-node app.ts` (use `npm run build:server` then `npm start` for running the compiled build).
- Build frontend only: `npm run build:frontend` (runs Angular CLI build in `frontend/`).
- Build backend only: `npm run build:server` (runs `tsc`).

## Tests
- Frontend unit tests: `npm run test` (delegates to Angular `ng test`).
- Server tests: `npm run test:server` (mocha + nyc via ts-node). Example: `nyc mocha -r ts-node/register test/server/**/*.ts`.
- E2E: `npm run e2e` (ts-node test/e2eTests.ts) and `cypress` targets available (`cypress:open`).

## Important scripts (see `package.json`)
- `serve:dev` — recommended for iterative development.
- `postinstall` — runs frontend install and build; CI may rely on this.
- `build:frontend`, `build:server`, `start`, `package:ci`, `lint`, `lint:fix`.

## Project-specific conventions & gotchas
- Vulnerability markers: many source files (notably `server.ts`) contain inline markers like `// vuln-code-snippet start|end` and `// vuln-code-snippet vuln-line`. These indicate intentional vulnerabilities and challenge code. Preserve those markers during edits unless intentionally changing challenge behavior.
- Routes: each file in `routes/` typically exports a function that returns an Express handler or router. `server.ts` wires them to URL paths. To add a route: create `routes/myRoute.ts` and wire in `server.ts` close to similar route patterns.
- Models: Sequelize models live in `models/` and are used directly in route handlers. Migrations are not present; data is seeded via `data/datacreator.ts` in startup.
- i18n: translation files live in `i18n/` and are loaded by `server.ts` via `i18n.configure(...)`.
- Frontend building: `frontend/` uses Angular CLI and outputs into `frontend/dist/frontend`, which the server serves statically in production.

## Integration points & external dependencies
- Config: `config/` and `config.schema.yml` are used via the `config` package; environment variable `NODE_ENV` influences behavior (common value: `guardian-store`).
- Swagger: `swagger.yml` and `swagger-ui-express` expose API docs at `/api-docs`.
- Logs: `logs/` has rotating access logs; there are routes that intentionally expose logs for challenges — be cautious.

## Quick examples (copyable snippets)
- Start dev server (recommended):
  - `npm run serve:dev`
- Build & run compiled server:
  - `npm run build:server`
  - `npm start`  # runs `node build/app`
- Add a new route skeleton (pattern):
  - create `routes/myFeature.ts` exporting a function or router
  - in `server.ts` require and `app.use('/myFeature', require('./routes/myFeature'))`

## What to avoid / preserve
- Do not remove or silently “sanitize” challenge/vulnerability code. Those are intentionally present for training/CTF scenarios and are annotated with `vuln-code-snippet` comments.
- Avoid changing environment-sensitive behavior without updating `package.json` scripts or `config/*`.

## Files to read first
- `server.ts` — middleware, routing, security-related patterns, and vulnerability markers.
- `app.ts` — startup sequence that validates dependencies then launches `server.start()`.
- `package.json` — scripts for building, serving, testing.
- `frontend/` — Angular app; consult when changing UI or endpoints consumed by frontend.

If anything here is unclear or you want an expanded section (e.g., more examples for tests or route wiring), tell me which part to expand and I'll iterate.
