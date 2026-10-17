# Walksy API: project structure

What every file and folder in the backend (`api/`) is for, and why it exists.

The backend is a **NestJS** app written in **TypeScript**. It stores data in **PostgreSQL**
(through **Prisma**), uses **Groq** for Walksy's AI answers and **LocationIQ** for place search.
The mobile app (`Walksy/`) never talks to the database or to Groq/LocationIQ directly:
everything goes through this backend.

```
App (phone)  →  api (NestJS)  →  PostgreSQL (Docker)
                     ├────────→  Groq (AI)
                     └────────→  LocationIQ (place search)
```

---

## How NestJS code is organized (read this first)

Every feature lives in its own folder (a **module**) and is split into the same few pieces:

| Piece | File name | Job |
|---|---|---|
| **Module** | `*.module.ts` | Groups one feature and tells NestJS which controller and service belong to it. |
| **Controller** | `*.controller.ts` | Receives HTTP requests (`GET /visits`, `POST /auth/login`, ...) and passes them on. No logic. |
| **Service** | `*.service.ts` | The actual work: rules, database queries, calls to Groq/LocationIQ. |
| **DTO** (Data Transfer Object) | `dto/*.dto.ts` | Describes what the app is **allowed to send**. Anything else is rejected with `400` before it reaches the service. |
| **Mapper** | `*.mapper.ts` | Turns a database row into what the app is **allowed to see** (e.g. never a password hash). |

Why: each file has one job, so code is easy to find, test and change.
A request always flows the same way:

```
request → JwtAuthGuard (logged in?) → ValidationPipe (DTO valid?) → Controller → Service → Prisma → database
```

---

## Root folder (`api/`)

| File / folder | What it is for | Why it's needed |
|---|---|---|
| `src/` | All the backend source code. | See the sections below. |
| `prisma/` | Database schema and migrations. | See [prisma/](#prisma--the-database). |
| `test/` | End-to-end tests (start the whole app and call real endpoints). | To check the API works as a whole, not just single functions. |
| `dist/` | The **compiled** JavaScript (created by `npm run build`). | Node.js runs JavaScript, not TypeScript. Generated, never edit, not in git. |
| `node_modules/` | Installed packages (created by `npm install`). | Generated, never edit, not in git. |
| `.env` | **Secret** settings: database password, API keys, JWT secret. | Secrets must never be in the code. **Never commit this file.** |
| `.env.example` | The same settings as `.env`, but **without** real values. | Shows a new developer which settings they need. Safe to commit. |
| `.gitignore` | Files git must ignore (`.env`, `node_modules`, `dist`, generated Prisma client). | Keeps secrets and generated files out of GitHub. |
| `package.json` | Project name, **scripts** (`npm run start:dev`, `build`, `test`) and the list of packages. | npm reads it to install packages and run commands. |
| `package-lock.json` | The exact installed version of every package. | Everyone (and the server) installs exactly the same versions. Commit it, never edit by hand. |
| `Dockerfile` | How the backend is built into a **Docker image**, in 3 stages: `build` (install + compile), `migrate` (applies database migrations once), `runtime` (only the compiled app + production packages, runs as a non-root user). | Lets the backend run the same way on any machine or server, without Node.js installed. Used by `docker-compose.yml` in the repo root. |
| `.dockerignore` | Files **not** copied into the image (`node_modules`, `dist`, `.env`, tests…). | Smaller, faster builds, and **secrets never end up inside the image**. |
| `prisma.config.ts` | Settings for the Prisma command line (`migrate`, `generate`, `studio`): where the schema is, where migrations go, the database URL. | Prisma 7 reads its settings from here; it loads `DATABASE_URL` from `.env`. |
| `nest-cli.json` | Settings for the NestJS command line (`nest build`, `nest g resource`). | Tells NestJS the code is in `src/` and to clean `dist/` before each build. |
| `tsconfig.json` | TypeScript settings (strict mode, CommonJS modules, decorators). | Used by your editor and by the type check. |
| `tsconfig.build.json` | TypeScript settings for the **build** only (leaves out tests). | Tests don't belong in the compiled app. |
| `tsconfig.build.tsbuildinfo` | Cache of the last build. | Makes the next build faster. Generated, safe to delete. |
| `jest.config.ts` | Settings for **Jest**, the test runner (`npm test`). | Tells Jest where tests are and how to run TypeScript. |
| `oxlint.json` | Settings for **oxlint**, the code checker (`npm run lint`). | Finds likely mistakes, e.g. promises that are never awaited. |
| `.prettierrc` | Code formatting rules (single quotes, trailing commas). | Everyone's code looks the same (`npm run format`). |
| `README.md` | The default NestJS readme. | How to install and run (generic). |
| `STRUCTURE.md` | This file. | Explains the project. |

---

## `prisma/`: the database

| File | What it is for | Why it's needed |
|---|---|---|
| `schema.prisma` | **The description of the whole database**: tables (`User`, `Place`, `Visit`), their columns, relations and enums (`UserType`, `AccessibilityNeed`, `PlaceCategory`, `VisitStatus`). | Single source of truth for the database. Prisma creates the tables and the TypeScript types from it. |
| `migrations/` | The history of every database change, as SQL. | Any database (yours, a teammate's, the server's) can be brought to the same state, step by step. **Commit them, never edit old ones.** |
| `migrations/20261013080049_init/` | First migration: creates `users`, `places`, `visits`. | |
| `migrations/20261013175036_visit_help/` | Adds the "Help Me" columns to `visits` (`guide`, `currentStep`, `summary`, `reminders`, `rating`). | |
| `migrations/migration_lock.toml` | Remembers the database type (PostgreSQL). | Stops migrations being applied to the wrong kind of database. |

**Changing the database:** edit `schema.prisma`, then run
`npx prisma migrate dev --name what-changed`. That creates a new migration, applies it
and regenerates the client.

---

## `src/`: the code

### Entry files

| File | What it is for | Why it's needed |
|---|---|---|
| `main.ts` | **Starts the server.** Turns on DTO validation for every request, allows requests from the app (CORS) and listens on port 3000 on `0.0.0.0`. | `0.0.0.0` means your phone on the same Wi-Fi can reach the backend, not only this PC. |
| `app.module.ts` | The **root module**: loads `.env` (ConfigModule) and connects all feature modules. | NestJS starts from here; a module not listed here doesn't exist for the app. |
| `app.controller.ts` | `GET /`: answers "Hello World!". Marked `@Public()`. | A quick "is the server running?" check, no login needed. |
| `app.service.ts` | Returns the "Hello World!" text. | Part of the NestJS starter, used by the check above. |
| `app.controller.spec.ts` | Unit test for `app.controller.ts`. | Example test from the starter. |

### `generated/prisma/`: the Prisma client (generated)

Created by `npx prisma generate` from `schema.prisma`. Contains the **TypeScript database client**
(`PrismaClient`), a type for every table (`User`, `Visit`, ...) and every enum.

Why: you get autocompletion and type errors when you use a wrong column name.
**Never edit it** (it's overwritten) and it's not in git (listed in `.gitignore`).

### `prisma/`: database connection

| File | What it is for | Why it's needed |
|---|---|---|
| `prisma.service.ts` | **One database connection pool** for the whole backend (`PrismaClient` + the PostgreSQL adapter). Connects on start, disconnects on stop. | Every service injects this instead of opening its own connection. Many connections would overload the database. |
| `prisma.module.ts` | Makes `PrismaService` **global**: any module can use it without importing it. | Less repeated code. |

### `common/`: shared helpers

| File | What it is for | Why it's needed |
|---|---|---|
| `api-error.ts` | `ApiError`: an error that always answers `{ code }` (e.g. `{ "code": "email_taken" }`) with the right HTTP status. | The app shows a translated message per code, in the user's language. |
| `ttl-cache.ts` | A small in-memory cache where entries expire after a while. | Used by place search so the same search isn't sent to LocationIQ twice (saves the free limit). |

### `auth/`: login and security

| File | What it is for | Why it's needed |
|---|---|---|
| `auth.module.ts` | Sets up JWT (secret and expiry from `.env`) and registers `JwtAuthGuard` for **every** route. | **Secure by default**: every endpoint needs a login unless marked `@Public()`. |
| `auth.controller.ts` | `POST /auth/register`, `POST /auth/login`, both `@Public()`. | The only ways in without a token. |
| `auth.service.ts` | Creates accounts (password hashed with **argon2**), checks logins, creates the **token**. Gives the same answer for "unknown email" and "wrong password". | argon2 = passwords are never stored readable. The same answer means nobody can find out which emails have an account. |
| `jwt-auth.guard.ts` | Runs before every request: reads `Authorization: Bearer <token>`, checks it, remembers who is asking. | Without a valid token the request stops with `401`. |
| `public.decorator.ts` | `@Public()`: marks a route as "no login needed". | The exception to "secure by default". |
| `current-user.decorator.ts` | `@CurrentUser()`: gives a controller the logged-in user's id. | Every query is limited to **your own** data. |
| `dto/register.dto.ts` | What registration needs: valid email, password of 8–128 characters, names, user type, accepted terms. | Bad input is rejected before it touches the database. |
| `dto/login.dto.ts` | Email + password. | Same reason. |

### `users/`: the profile

| File | What it is for | Why it's needed |
|---|---|---|
| `users.module.ts` | Groups the users feature. | |
| `users.controller.ts` | `GET /users/me` (who am I), `PATCH /users/me` (language, companion name, accessibility needs). | The app's Profile and Personalize screens. |
| `users.service.ts` | Loads and updates the profile. Accessibility needs are saved **only with consent**; withdrawing consent deletes them. | Accessibility needs are **health data** under the GDPR. |
| `user.mapper.ts` | What the app may see about a user. **Never the password hash.** | Protects sensitive fields. |
| `dto/update-profile.dto.ts` | Allowed profile changes (all optional). | Validation. |

### `visits/`: visits, Help Me, statistics

| File | What it is for | Why it's needed |
|---|---|---|
| `visits.module.ts` | Groups the visits feature; imports `AssistantModule`. | Walksy writes the "Help Me" steps and the summary. |
| `visits.controller.ts` | All `/visits` endpoints (table below). | |
| `visits.service.ts` | Creating visits (and saving the place), status changes (start, end, cancel, only from the right status), Help Me (prepare steps, save progress, finish with summary), feedback, SDG statistics. | The visit rules in one place. Someone else's visit always answers "not found". |
| `visit.mapper.ts` | What the app receives for a visit. Also safely reads the JSON columns (`guide`, `reminders`). | JSON columns can hold anything, so only the expected shapes are accepted. |
| `sdg.ts` | **The rules for the Statistics page**: which UN Sustainable Development Goal each visit supports (hospital → 3, bank → 8, ...). | One place for the rules, so every number can be explained and changed in one spot. |
| `dto/create-visit.dto.ts` | A new visit: place, title, start time, notify/ride, start now or later, optional guide. | Validation. |
| `dto/visit-guide.dto.ts` | The steps + documents the app got from Walksy's chat. | Saved with the visit, so "Help Me" shows the same steps. |
| `dto/visit-progress.dto.ts` | How many steps are done. | "Pause help" continues where you stopped. |
| `dto/visit-feedback.dto.ts` | Stars (1–5) and reminder switches. | "All done!" page. |
| `dto/sdg-stats-query.dto.ts` | The period (from / to) for statistics. | Statistics page month switcher. |

### `places/`: place search

| File | What it is for | Why it's needed |
|---|---|---|
| `places.module.ts` | Groups the feature. | |
| `places.controller.ts` | `GET /places/search?q=...&lang=...` | "Create a new visit" search field. |
| `places.service.ts` | **The only file that talks to LocationIQ.** Searches Slovenia, caches results for 24 hours. | The API key stays on the server. Changing provider later only changes this file. |
| `place-category.ts` | Turns OpenStreetMap types (`amenity=pharmacy`, `shop=*`, ...) into Walksy's categories. | The category picks the icon, the suggestion cards and the SDGs. |
| `place.types.ts` | The place categories and the shape of a search result. | Shared by places, assistant and visits. |
| `dto/search-places.dto.ts` | Search text (3–100 characters), language. | Validation; protects the daily free limit. |

### `assistant/`: Walksy, the AI companion

| File | What it is for | Why it's needed |
|---|---|---|
| `assistant.module.ts` | Groups the feature; **exports** `AssistantService` for the visits module. | |
| `assistant.controller.ts` | `POST /assistant/chat` (answer streamed word by word), `POST /assistant/guide` (documents + steps for a suggestion card). | The chat on the Visits tab. |
| `assistant.service.ts` | **The only file that talks to Groq.** Streams chat answers; asks for exact JSON (guide, summary) and checks it. | The API key stays on the server. Changing AI provider later only changes this file. |
| `assistant.prompt.ts` | **What Walksy is told**: personality and rules (short steps, never invent fees, mention 112/SOS in emergencies), plus the instructions and JSON shapes for guides and summaries. | Walksy's behaviour is changed here, without touching code. |
| `assistant.types.ts` | Shapes of stream events, error codes, guide and summary. | Shared types. |
| `dto/chat-request.dto.ts` | A chat request: the conversation (max 20 messages, 1000 characters each) + context (place, needs, language). | Validation; keeps requests small for the free tier. |
| `dto/guide-request.dto.ts` | The suggestion card topic + context. | Validation. |

---

## All endpoints

All need a login (`Authorization: Bearer <token>`) unless marked **public**.

| Method & path | What it does |
|---|---|
| `GET /` | **public**, "is the server running?" |
| `POST /auth/register` | **public**, create an account → `{ token, user }` |
| `POST /auth/login` | **public**, log in → `{ token, user }` |
| `GET /users/me` | the logged-in user |
| `PATCH /users/me` | change language, companion name, accessibility needs (+ consent) |
| `GET /visits` | all my visits |
| `POST /visits` | create a visit |
| `POST /visits/:id/start` · `/end` · `/cancel` | change a visit's status |
| `POST /visits/:id/help` | Help Me: steps ready, visit started |
| `POST /visits/:id/progress` | save the current step |
| `POST /visits/:id/complete` | last step done: visit ends, Walksy writes summary + reminders |
| `PATCH /visits/:id/feedback` | stars and reminder switches |
| `GET /visits/sdg-stats?from=&to=` | SDG statistics for a period |
| `GET /places/search?q=&lang=` | search places in Slovenia |
| `POST /assistant/chat` | Walksy's chat answer (streamed) |
| `POST /assistant/guide` | documents + steps for a suggestion card |

---

## `test/`

| File | What it is for |
|---|---|
| `app.e2e-spec.ts` | End-to-end test: starts the app and calls `GET /`. (From the NestJS starter, to be extended.) |
| `jest-e2e.json` | Jest settings for end-to-end tests (`npm run test:e2e`). |

---

## Everyday commands (run in `api/`)

| Command | What it does |
|---|---|
| `npm run start:dev` | Start the backend; restarts on every saved change. |
| `npx prisma migrate dev --name xyz` | After changing `schema.prisma`: update the database + client. |
| `npx prisma generate` | Regenerate the Prisma client only. |
| `npx prisma studio` | Look at the data in your browser. |
| `npm run build` | Compile to `dist/`. |
| `npm test` | Run the tests. |
| `npm run lint` / `npm run format` | Check / format the code. |
| `docker start my-postgres` | Start the old development database container (only for `npm run start:dev`). |

### Running with Docker Compose (from `C:\WalksyIOSapp`, not `api/`)

| Command | What it does |
|---|---|
| `docker compose up -d --build` | Build and start **database + backend**; migrations are applied automatically. |
| `docker compose logs -f api` | Watch the backend's logs. |
| `docker compose ps` | See what's running (and whether it's healthy). |
| `docker compose down` | Stop everything. The data stays in the `walksy_db-data` volume. |
| `docker compose down -v` | Stop **and delete the data**. ⚠️ |

The database password for Compose is in `C:\WalksyIOSapp\.env` (`POSTGRES_PASSWORD`).
The keys and JWT secret come from `api/.env`. Compose replaces only `DATABASE_URL`, pointing it at the `db` container.
