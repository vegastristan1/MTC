<!--
Repository-specific Copilot instructions for the MTC project.
Keep this file short and focused: what an AI assistant needs to know to be productive.
-->

# Copilot instructions — MTC (Node + React)

This project is a full-stack dashboard with a React frontend (`client/`) and an Express backend (`server/`). The goal of these instructions is to give AI coding agents immediate, actionable context so edits and suggestions are safe and consistent.

Key facts
- Backend: `server/server.js` (Express). Routes live in `server/routes/*.js` and DB config is in `server/db.js`.
- Frontend: Create React App in `client/`. Entrypoint and app logic under `client/src/` and production build in `client/build/` (already present).
- DB: uses `mssql` driver; queries are in route handlers (example: `server/routes/arTrnSummary.js`, `server/routes/sorMaster.js`).
- Dev ports: frontend dev server runs on 3000; backend typically runs on 5000 (see `server/package.json` scripts).

What to do first when changing code
- Run `npm install` in both `server/` and `client/` before running or testing.
- Backend: use `npm run dev` (nodemon) from `server/` to run with auto-reload.
- Frontend: use `npm start` from `client/` for CRA dev server. In production, `client/build/` contains compiled assets.

Project-specific patterns and conventions
- Routes are simple Express handlers that open a connection with `mssql` and directly run SQL queries. Prefer minimal edits to SQL strings unless fixing a bug or adding parameters.
- No ORM is used. Expect raw SQL in route files; pay attention to string concatenation and potential SQL injection risks. When adding parameters, use parameterized queries or the tagged template style supported by `mssql`.
- Database configuration is loaded from `server/db.js` (which expects environment variables). Don't hardcode credentials; prefer adding to `.env` in `server/` when necessary.
- Frontend uses Axios (see `client/package.json`) and the CRA `proxy` key is already set to `http://localhost:5000`. Use relative `/api/...` paths in development.

Files to inspect when making changes (examples)
- `server/server.js` — main Express setup (CORS, JSON parsing, route mounting).
- `server/routes/arTrnSummary.js` and `server/routes/sorMaster.js` — examples of API handlers returning DB rows.
- `server/db.js` — DB connection config for `mssql`.
- `client/package.json` and `client/README.md` — CRA scripts and dev workflow.
- `client/build/` — production build artifacts (do not edit directly unless deploying static site).

Style and safety guidance (concrete, codebase-specific)
- Avoid changing `client/build/` files; update source in `client/src/` and run `npm run build`.
- When modifying routes, keep responses JSON arrays/objects (existing frontend expects recordsets). Preserve property names coming from SQL unless the frontend is updated simultaneously.
- When adding new endpoints, follow the `/api/YourEndpoint` pattern and mount under `/api/...` in `server/server.js`.
- Tests: there are no project tests. If adding tests, put backend tests under `server/` and frontend tests under `client/src/__tests__/` following CRA conventions.

Common quick fixes the repo needs (if encountered)
- Missing `.env` or DB creds: add `.env` in `server/` with DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE.
- CORS issues: `server/server.js` already applies `cors()`. If adding headers, be conservative.
- SQL errors: inspect the raw query strings in `server/routes/*` and the shape of `result.recordset` returned by `mssql`.

When uncertain
- Ask the user for missing runtime details (DB credentials, expected port changes, or deployment target) before making impactful changes like migrations or auth.

Done: Add or update this file and ask for clarification when a change would touch deployment, secrets, or external services.
