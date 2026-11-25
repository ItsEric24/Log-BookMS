# Log-Book Management System

## Project overview

Log-BookMS is a full-stack academic and internship log-book application split into two Node.js applications:

1. **`log-book-MS/`** is the React user interface.
2. **`log-book-MS-backend/`** is the Express and PostgreSQL REST API.

### Motivation

The motivation for this project came from seeing that schools in Kenya still handle logbook processes with physical paper. This project explores how to automate that process with a system that makes logging, reviewing, approving, and managing academic or internship logbooks faster and more accessible.

Students use the system to:

- Register and log in.
- Record daily work activities, the skills learned, and the dates of those activities.
- Filter and review daily entries by week.
- Submit a weekly logbook containing daily entries and a weekly summary.
- Track whether submitted logbooks are pending or approved.
- Download approved logbooks as PDF reports.
- Delete their own log entries or logbooks.

Supervisors use a separate interface to:

- View submitted logbooks belonging to their school and department.
- Read each student's daily entries and weekly summary.
- Add a supervisor comment, signature name, and phone number.
- Approve a logbook.
- Review system-wide total, approved, and pending submission counts.

The frontend is currently run on port `3000` and calls an API running on port `8000`. PostgreSQL is the persistent data store.

## Architecture

```text
Browser
  |
  | React Router navigation
  | Fetch API requests with Bearer JWT
  v
React + Vite frontend (:3000)
  | React Context state for auth, student logs, student logbooks, and admin logs
  | localStorage for token and current-user profile
  v
Express REST API (:8000)
  | Route modules
  | JWT authentication and role middleware
  | Parameterized PostgreSQL queries
  v
PostgreSQL
  | members
  | daily_logs
  | logbooks
  v
PDFKit response and Nodemailer SMTP service
```

There is no server-side frontend rendering and no separate controller layer. Express route files act as routing and business-logic modules, while small utility modules handle JWT authentication, UUID validation, PDF rendering, and email delivery.

## Repository layout

```text
log-book-project/
├── README.md                         This project documentation
├── log-book-MS/                      React/Vite frontend
└── log-book-MS-backend/              Express/PostgreSQL backend
```

Both applications have their own `.gitignore`, package manifest, and dependency installation. The frontend is a pnpm workspace/project, while the backend uses npm.

## Technology stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite 6 | Development server and production bundler |
| React Router DOM 7 | Browser routes and nested dashboard layouts |
| React Context | Shared authentication and logbook state |
| React Toastify | Success and error notifications |
| React Icons | Navigation and status icons |
| React Loader Spinner | Loading indicators |
| ESLint 9/10 configuration | Source linting |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 4 | REST API and middleware |
| PostgreSQL | Persistent relational data |
| `pg` | PostgreSQL connection pool |
| JSON Web Tokens | Authentication |
| bcrypt | Password hashing |
| Nodemailer | Gmail SMTP email delivery |
| PDFKit / pdfkit-table | PDF report generation |
| Morgan | Development HTTP request logging |
| Cors | Browser cross-origin request support |
| Dotenv | Environment-variable loading |
| Nodemon | Development server auto-reload |

## Frontend documentation

### Frontend root files

| Path | Responsibility |
|---|---|
| `package.json` | Frontend dependencies and `dev`, `build`, `lint`, and `preview` scripts. |
| `pnpm-lock.yaml` | Exact pnpm dependency resolution. |
| `pnpm-workspace.yaml` | pnpm workspace configuration. |
| `vite.config.js` | Registers the React plugin and configures Vite's development server on port `3000`. |
| `eslint.config.js` | ESLint flat configuration for JavaScript/JSX, React, hooks, and refresh rules. |
| `index.html` | Vite HTML shell. It contains the React mount element and loads `src/main.jsx`. |
| `README.md` | Template-level frontend information; the root README in this repository is the project-level documentation. |
| `public/log.svg` | Application favicon asset referenced by `index.html`. |
| `public/vite.svg` | Default Vite asset retained in the template; it is not part of the application's UI. |

### Frontend source entry points

| Path | Responsibility |
|---|---|
| `src/main.jsx` | Browser entry point. Creates the React root, wraps the app in `StrictMode` and `AppProvider`, and loads global styles. |
| `src/App.jsx` | Main application router. Declares public, student, and supervisor routes and redirects `/` to `/login`. |
| `src/index.css` | Browser resets and the Inter global font. |
| `src/App.css` | Imported in the unused `src/app/App.jsx` prototype; the active application does not use this file. |

### React Context application state

| Path | Responsibility |
|---|---|
| `src/app/AppContext.jsx` | Provides login/logout, token and user persistence, shared daily-log/logbook collections, loading/error state, and fetch methods through `useAppContext()`. |

The frontend uses Context for shared authentication and collection state, alongside direct `fetch()` calls for page-specific counts and mutations:

- `AppProvider` owns login/logout and loads daily logs, student logbooks, and supervisor logbooks.
- Counts and mutations are still loaded or performed directly inside pages.
- `localStorage` stores `token` and `user`; it is not a secure server-side session.

### Frontend routes

| Route | Component | Purpose |
|---|---|---|
| `/` | `Navigate` | Redirects to `/login`. |
| `/login` | `Login` | Department-aware login form. Existing tokens redirect to `/dashboard`. |
| `/sign-up` | `SignUp` | Student account registration. |
| `/dashboard` | `Dashboard` | Authenticated student layout with sidebar, header, and nested route outlet. |
| `/dashboard` | `MainContent` | Student submission-count cards. |
| `/dashboard/logbooks` | `AllLogbooks` | Lists the student's submitted weekly logbooks. |
| `/dashboard/logbook/:id` | `SingleLogbook` | Shows and deletes a logbook and downloads its PDF. |
| `/dashboard/submit-logbook` | `SubmitLogbook` | Compiles one week of daily logs into a weekly logbook. |
| `/dashboard/daily-logs` | `DailyLogs` | Filters, creates, and opens daily log entries. |
| `/dashboard/daily-log/:id` | `SIngleDailyLog` | Updates or deletes an individual daily entry. |
| `/admin` | `AdminDashboard` | Authenticated supervisor layout and nested route outlet. |
| `/admin` | `AdminHome` | System-wide submission-count cards. |
| `/admin/logbooks` | `AdminLogbooks` | Lists logbooks in the supervisor's school and department. |
| `/admin/logbook/:id` | `AdminLogbookView` | Reviews and approves a logbook. |

The route layout is role-assisted on the client: `/dashboard` redirects supervisors to `/admin`, and `/admin` checks the locally stored role. The backend remains responsible for real role enforcement on protected endpoints.

### Frontend pages

| Path | Responsibility |
|---|---|
| `src/pages/Login/Login.jsx` | Collects email, password, department, and school. Dispatches `login`, stores the API response, shows toast feedback, and redirects. |
| `src/pages/Login/Login.css` | Login-specific styles (shared authentication styles also live in `Auth.css`). |
| `src/pages/SignUp/SignUp.jsx` | Validates and submits registration details; handles duplicate-email feedback. |
| `src/pages/Auth.css` | Shared login and registration card, form, input, and button styles. |
| `src/pages/Dashboard/Dashboard.jsx` | Guards `/dashboard`, redirects supervisors and unauthenticated users, and renders `Sidebar` plus `Header`. |
| `src/pages/Dashboard/Dashboard.css` | Student dashboard layout styles. |
| `src/pages/MainContent/MainContent.jsx` | Loads total, approved, and pending counts for the logged-in student. |
| `src/pages/MainContent/MainContent.css` | Student home/grid styles. |
| `src/pages/DailyLogs/DailyLogs.jsx` | Lists daily logs by selected week and opens the daily-log creation modal. |
| `src/pages/DailyLogs/DailyLogs.css` | Daily-log list and filter styles. |
| `src/pages/SIngleDailyLog/SingleDailyLog.jsx` | Loads one daily entry, then supports update and confirmed deletion. |
| `src/pages/SIngleDailyLog/SingleDailyLog.css` | Daily-entry detail styles. |
| `src/pages/SubmitLogbook/SubmitLogbook.jsx` | Selects a week, compiles matching logs and a summary, submits the logbook, and calls the email helper. |
| `src/pages/SubmitLogbook/SubmitLogbook.css` | Weekly submission and summary styles. |
| `src/pages/AllLogbooks/AllLogbooks.jsx` | Loads and renders all logbooks belonging to the logged-in student. |
| `src/pages/AllLogbooks/AllLogbooks.css` | Student logbook-list styles. |
| `src/pages/SingleLogbook/SingleLogbook.jsx` | Displays, deletes, and downloads a weekly logbook. |
| `src/pages/SingleLogbook/SingleLogbook.css` | Student logbook-document styles. |
| `src/pages/AdminDashboard/Admin.jsx` | Guards `/admin`, provides the supervisor navigation sidebar, and renders supervisor pages. |
| `src/pages/AdminDashboard/Admin.css` | Supervisor dashboard layout styles. |
| `src/pages/AdminHome/AdminHome.jsx` | Loads system-wide total, approved, and pending counts. |
| `src/pages/AdminHome/AdminHome.css` | Supervisor home styles. |
| `src/pages/AdminLogbooks/AdminLogbooks.jsx` | Filters all API logbooks to the supervisor's school and department and optionally a week. |
| `src/pages/AdminLogbooks/AdminLogbooks.css` | Supervisor logbook-list and filter styles. |
| `src/pages/AdminLogbookView/AdminLogbookView.jsx` | Lets supervisors edit comments, signed-by name, and phone number and approve the logbook. |
| `src/pages/AdminLogbookView/AdminLogbookView.css` | Supervisor review-document styles. |

### Frontend components

| Path | Responsibility |
|---|---|
| `src/components/Header/Header.jsx` | Reads the Context user and displays the user's name or “Admin”. |
| `src/components/Header/Header.css` | Header and profile-avatar layout. |
| `src/components/Sidebar/Sidebar.jsx` | Student navigation links and logout action. |
| `src/components/Sidebar/Sidebar.css` | Student sidebar layout and menu states. |
| `src/components/StatusCard/StatusCard.jsx` | Reusable dashboard statistic tile for title, value, and icon. |
| `src/components/StatusCard/StatusCard.css` | Statistic-card presentation. |
| `src/components/DailyModal/DailyModal.jsx` | Create/update form for week, day, date, work description, and skills learned. |
| `src/components/DailyModal/DailyModal.css` | Modal overlay and form styles. |
| `src/components/DeleteModal/DeleteModal.jsx` | Generic confirmed-deletion dialog. |
| `src/components/DeleteModal/DeleteModal.css` | Deletion-dialog styles. |
| `src/components/ApproveModal/ApproveModal.jsx` | Standalone approval form prototype with comments and signature fields. It is not currently used by `AdminLogbookView`. |
| `src/components/ApproveModal/ApproveModal.css` | Approval-modal styles. |
| `src/components/Loader/Loader.jsx` | Wrapper around React Loader Spinner's oval animation. |
| `src/components/Loader/Loader.css` | Loader presentation. |

### Frontend assets and utilities

| Path | Responsibility |
|---|---|
| `src/assets/book-image.jpg` | Image asset present in the repository. It is not currently referenced by the routed application. |
| `src/assets/user.png` | Header profile avatar used by `Header.jsx`. |
| `src/utils/helperFunc.js` | `sendEmail()` Fetch wrapper for `/api/logbooks/send-email`. |
| `src/utils/data.js` | Hard-coded example daily-log and logbook objects; it is sample/reference data, not runtime state. |
| `src/app/App.jsx` | Unused PDF-download prototype. It calls `http://localhost:3000/generate-pdf`, an endpoint that is not mounted in this Express app. |

## Backend documentation

### Backend root files

| Path | Responsibility |
|---|---|
| `app.js` | Loads environment variables and middleware, mounts the three API routers, and listens on port `8000`. |
| `package.json` | Backend metadata, dependencies, and the `npm start` development command. |
| `package-lock.json` | Exact npm dependency resolution. |
| `.env` | Local database, JWT, and SMTP values. It is ignored by Git and must not be committed. |
| `.gitignore` | Ignores logs, dependencies, builds, editor settings, local files, and `.env`. |
| `README.md` | Backend-specific setup and API overview. |
| `DATABASE_SCHEMA.md` | Evidence-based database schema description and inferred DDL reconstruction. |

### Express startup and middleware

`app.js` configures Express in this order:

1. `express.json()` parses JSON request bodies.
2. `cors()` allows cross-origin frontend requests.
3. `morgan("dev")` logs HTTP requests in development format.
4. `/api/daily-logs` mounts `dailyLogRouter`.
5. `/api/logbooks` mounts `logBookRouter`.
6. `/api/users` mounts `userRouter`.
7. The server listens on port `8000`.

### Backend folders

| Path | Responsibility |
|---|---|
| `db/` | Database connection setup. |
| `routes/` | Express route modules and API SQL operations. |
| `routes/userRoutes/` | Registration and login endpoints. |
| `routes/dailyLogRoutes/` | Daily-entry CRUD endpoints. |
| `routes/logBookRoutes/` | Weekly logbooks, counts, supervisor actions, PDF, and email endpoints. |
| `utils/` | Authentication, UUID, and PDF helpers. |
| `services/` | External-service integrations. |

### Database connection

`db/db.js` exports a small `query(qstr, params)` wrapper around a `pg.Pool`. The pool reads:

- `DB_HOST`
- `DB_USER`
- `DB_PORT`
- `DB_PASSWORD`
- `DB_NAME`

SQL statements use PostgreSQL positional parameters (`$1`, `$2`, and so on). This avoids directly interpolating request values into SQL.

### Authentication utilities

`utils/auth.js` provides:

- `createToken(user)`: signs `{ id, email, role }` with `JWT_SECRET` for one day.
- `validateToken(token)`: verifies a JWT.
- `authenticateUser`: reads `Authorization: Bearer <token>`, verifies it, and stores its payload in `req.user`.
- `isSupervisor`: rejects users whose token role is not `supervisor`.

Every protected route uses `authenticateUser`. Supervisor-only routes add `isSupervisor`. The frontend token is normally stored in `localStorage` and sent in the `Authorization` header.

### Backend route files

#### `routes/userRoutes/userRoutes.js`

- `POST /api/users/register`
  - Requires name, email, password, department, and school.
  - Hashes passwords with bcrypt using 10 salt rounds.
  - Rejects an existing email.
  - Inserts a `members` record with the default database role.
- `POST /api/users/login`
  - Requires email, password, department, and school.
  - Checks the member by email and department.
  - Compares the submitted password with the stored bcrypt hash.
  - Returns the JWT and a user object with the password removed.

#### `routes/dailyLogRoutes/dailyLogRoutes.js`

- `POST /api/daily-logs/add`
  - Creates a daily entry.
  - Deduplicates on student, week, day, and date.
- `GET /api/daily-logs/:id`
  - Lists all daily logs belonging to a student ID.
- `GET /api/daily-logs/daily-log/:id`
  - Loads one entry by entry ID.
- `PUT /api/daily-logs/:id`
  - Updates day, date, week, work description, and skills learned.
- `DELETE /api/daily-logs/:id`
  - Deletes an entry.

#### `routes/logBookRoutes/logbookRoutes.js`

- `POST /api/logbooks/add`
  - Inserts a weekly logbook containing embedded JSON daily logs and its summary.
- `GET /api/logbooks/:studentId`
  - Lists logbooks for one student.
- `GET /api/logbooks/logbook/:logbookId`
  - Loads one logbook by ID.
- `DELETE /api/logbooks/logbook/:id`
  - Deletes one logbook.
- `GET /api/logbooks/total/:studentId`
- `GET /api/logbooks/approved/:studentId`
- `GET /api/logbooks/unapproved/:studentId`
  - Return student-specific count rows.
- `GET /api/logbooks/admin/logbooks`
- `GET /api/logbooks/admin/logbooks/total`
- `GET /api/logbooks/admin/logbooks/approved`
- `GET /api/logbooks/admin/logbooks/unapproved`
  - Return global admin data and counts; these require supervisor role.
- `PUT /api/logbooks/admin/logbook/comments/:id`
- `PUT /api/logbooks/admin/logbook/supervisor-phone/:id`
- `PUT /api/logbooks/admin/logbook/signedby/:id`
- `PUT /api/logbooks/admin/logbook/approve/:id`
  - Update supervisor-review fields or set `is_approved = true`; these require supervisor role.
- `GET /api/logbooks/logbook/pdf/:logbookId`
  - Streams a PDF generated from a logbook.
- `POST /api/logbooks/send-email`
  - Sends an email through the configured SMTP service.

### PDF generation

`utils/utils.js` exports `generatePDF(data, output)`. It creates an A4 `PDFDocument`, pipes it to the Express response, and renders:

- Student ID and name.
- Week number and department.
- Submission date.
- Weekly summary.
- A table containing day, date, skills learned, and work description.
- Supervisor comments.
- Signed-by name.

The route streams the PDF response as `weekly-logs.pdf`.

### Email service

`services/emailService.js` creates a Gmail SMTP transport on port `587` using `EMAIL` and `EMAIL_PASSWORD` from the environment. `sendEmail()` sends `from`, `to`, `subject`, and `text` values and reports success or failure.

The student submission page currently calls the email route after creating a logbook, but the sender and recipient values are hard-coded in the frontend.

## Database model

The application uses three PostgreSQL tables. The exact live DDL should be confirmed with the database because `DATABASE_SCHEMA.md` is evidence-based and marks uncertain constraints.

```text
members
  1 ──< logbooks
  1 ──< daily_logs
```

Daily entries and weekly logbooks are linked conceptually through `student_id` and `week_number`. The database contains no direct foreign key from a logbook row to individual daily-log rows; `logbooks.daily_logs` is a JSON/JSONB snapshot of the entries selected at submission time.

### `members`

| Column | Inferred meaning |
|---|---|
| `id` | UUID primary key, auto-generated by PostgreSQL |
| `name` | Full name |
| `email` | Unique email/login identifier |
| `password` | bcrypt password hash |
| `department` | Infrastructure, KNOC, Support, Cybersecurity, or another stored text value |
| `school` | Student/supervisor school identifier |
| `role` | User role; application checks `supervisor`, default is assumed `student` |

### `daily_logs`

| Column | Inferred meaning |
|---|---|
| `id` | UUID primary key |
| `student_id` | Foreign key/reference to `members.id` |
| `day` | Weekday name |
| `date` | Date of the entry |
| `week_number` | Week number, UI range 1–12 |
| `description_of_work` | Description of work performed |
| `skills_learnt` | Skills or lessons learned |

The application deduplicates entries using student ID, week number, day, and date.

### `logbooks`

| Column | Inferred meaning |
|---|---|
| `id` | UUID primary key |
| `student_id` | Foreign key/reference to `members.id` |
| `week_number` | Submitted week |
| `weekly_summary` | Summary of the week's work |
| `daily_logs` | JSON/JSONB array snapshot |
| `department` | Department copied at submission |
| `student_name` | Student name copied at submission |
| `school` | School copied at submission |
| `supervisor_comments` | Optional supervisor comment |
| `supervisor_phone` | Optional supervisor phone number |
| `signed_by` | Optional supervisor/signatory name |
| `is_approved` | Approval state, default false |
| `date` | Submission date |

See [the detailed database schema](/Users/rico/Documents/log-book-project/log-book-MS-backend/DATABASE_SCHEMA.md) for inferred DDL, relationships, indexes, constraints, and known uncertainties.

## Authentication and user flow

1. A student submits registration details.
2. The backend hashes the password and stores the member.
3. Login requires matching email, department, password, and school input.
4. The backend creates a one-day JWT containing the member ID, email, and role.
5. The frontend stores the token and member object in `localStorage`.
6. Protected requests include `Authorization: Bearer <token>`.
7. `authenticateUser` verifies the token.
8. `isSupervisor` grants administrative route access only when the role is `supervisor`.
9. Logout removes the frontend token and user object.

## Environment setup

### Frontend

From the repository root:

```bash
cd log-book-MS
pnpm install
pnpm dev
```

The UI is available at `http://localhost:3000`.

The frontend currently hard-codes `http://localhost:8000` in API calls, so no frontend environment variable is required for the local setup.

### Backend

From the repository root:

```bash
cd log-book-MS-backend
npm install
npm start
```

`npm start` invokes Nodemon and starts the API on `http://localhost:8000`.

Create `log-book-MS-backend/.env` with:

```env
DB_HOST=localhost
DB_USER=<postgres-user>
DB_PORT=5432
DB_PASSWORD=<postgres-password>
DB_NAME=logbookMS

JWT_SECRET=<a-long-random-secret>

EMAIL=<gmail-address>
EMAIL_PASSWORD=<gmail-app-password>
```

PostgreSQL must contain the `members`, `daily_logs`, and `logbooks` tables and suitable UUID defaults/foreign keys. Database setup details and reconstruction SQL are documented in `DATABASE_SCHEMA.md`.

## Development commands

### Frontend

```bash
cd log-book-MS
pnpm dev      # Development server
pnpm build    # Production build
pnpm lint     # ESLint
pnpm preview  # Preview a built bundle
```

### Backend

```bash
cd log-book-MS-backend
npm start     # Nodemon development server
npm test      # Placeholder; no test runner is configured
```

## Validation and current verification

The frontend production build succeeds with Vite.

The frontend lint command currently reports two unused symbols in `src/pages/DailyLogs/DailyLogs.jsx`:

- `Loader`
- `loading`

The backend has no automated test suite and no test script beyond the package-generated failure placeholder.

## Current implementation notes and gaps

The main implementation gaps listed previously have been addressed:

- Authentication now validates a missing or malformed `Bearer` header safely.
- Login checks email, password, department, and school together.
- Registration, login, CRUD, and mutation SQL operations are awaited before success responses.
- Student and logbook routes enforce owner/staff authorization and validate relevant UUID parameters.
- The backend has a catch-all API 404 and centralized error middleware.
- Pending logbooks now disable PDF generation until `is_approved === true`.
- PDF export is also blocked server-side for unapproved logbooks.
- Supervisor approval returns to `/admin/logbooks`.
- Login redirects supervisors and students to their appropriate dashboards.
- Submission email sender/recipient values now come from `EMAIL` and `SUPERVISOR_EMAIL` environment variables.
- Duplicate daily logs and duplicate weekly logbooks are rejected.
- Misleading hard-coded rejected-log cards have been removed because the schema has no rejection status.

Remaining work:

- The frontend still uses `localStorage` for authentication; tokens and users are browser-visible.
- The project does not yet have migrations or seed scripts; schema setup remains manual.
- Automated frontend and backend test suites are still needed.
- Demo/legacy files such as `src/app/App.jsx`, `src/utils/data.js`, and `ApproveModal.jsx` remain present.
- Before production, rotate exposed secrets and database credentials, move static API URLs to environment configuration, and add rate limiting.
- Use secure HTTP-only cookies or a more robust token-storage strategy.
- Add supervisor restrictions consistently to every admin-only route.
- Centralize API configuration and allow deployment URLs.
- Require the PDF endpoint to reject unapproved or unauthorized logbooks.
- Add duplicate weekly-logbook and database constraints.
- Await database operations and return consistent 404/500 responses.
- Replace hard-coded email addresses with verified supervisor recipients.
- Add schema migrations and seed/configuration scripts.
- Add automated integration and authorization tests.
- Remove or isolate legacy demo files if they are no longer used.
