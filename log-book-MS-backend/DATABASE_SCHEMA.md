# Database Schema

Database: **PostgreSQL** (`logbookMS`)
Connection: `pg` Pool via `db/db.js`

---

## members

| Column     | Likely Type     | Nullable | Primary Key | Foreign Key | Evidence / Notes |
|------------|-----------------|----------|-------------|-------------|------------------|
| id         | `UUID`          | NO       | YES         |             | Used in JWT payload (`auth.js:6`), validated via `isValidUUID()` in routes. Auto-generated (never in INSERT). |
| name       | `TEXT` or `VARCHAR(255)` | NO |             |             | Inserted in `userRoutes.js:27`. Required by validation. |
| email      | `TEXT` or `VARCHAR(255)` | NO |             |             | Used in WHERE clauses (`userRoutes.js:18`, `userRoutes.js:46`, `userRoutes.js:57`). Duplicate check before INSERT implies UNIQUE. |
| password   | `VARCHAR(255)`  | NO       |             |             | Stores bcrypt hash (10 salt rounds, `userRoutes.js:15`). bcrypt output is 60 chars; VARCHAR(255) is standard. |
| department | `TEXT` or `VARCHAR(255)` | NO |             |             | Used in WHERE clause (`userRoutes.js:46`). Required by validation. |
| school     | `TEXT` or `VARCHAR(255)` | NO |             |             | Inserted in `userRoutes.js:27`. Required by validation. |
| role       | `TEXT` or `VARCHAR(50)`  | NO  |             |             | Read from user object in JWT creation (`auth.js:6`). NOT included in INSERT → must have a DEFAULT. Compared against `'supervisor'` in `auth.js:30`. Default is likely `'student'`. |

### Evidence summary

- **INSERT**: `INSERT INTO members (name, email, password, department, school) VALUES ($1, $2, $3, $4, $5)` — `userRoutes.js:27`
- **SELECT by email**: `SELECT * FROM members WHERE email = $1` — `userRoutes.js:18`, `userRoutes.js:57`
- **SELECT by email+dept**: `SELECT * FROM members WHERE email = $1 AND department = $2` — `userRoutes.js:46`
- **JWT payload**: `{ id: user.id, email: user.email, role: user.role }` — `auth.js:6`
- **Role check**: `req.user.role !== 'supervisor'` — `auth.js:30`

---

## logbooks

| Column            | Likely Type              | Nullable | Primary Key | Foreign Key          | Evidence / Notes |
|-------------------|--------------------------|----------|-------------|----------------------|------------------|
| id                | `UUID`                   | NO       | YES         |                      | Used in WHERE clauses, validated via `isValidUUID()` (`logbookRoutes.js:85`). Auto-generated. |
| student_id        | `UUID`                   | NO       |             | → `members.id`       | Inserted (`logbookRoutes.js:37`), used in WHERE and COUNT queries. References a member. |
| week_number       | `INTEGER`                | NO       |             |                      | Inserted (`logbookRoutes.js:37`). Used in PDF rendering (`utils.js:43`). |
| weekly_summary    | `TEXT`                   | NO       |             |                      | Inserted (`logbookRoutes.js:37`). Rendered as free-text in PDF (`utils.js:64`). |
| daily_logs        | `JSONB` or `JSON`        | NO       |             |                      | Inserted as `dailyLogs` from request body (`logbookRoutes.js:38`). Mapped over in PDF generation (`utils.js:82`) with properties `day`, `date`, `skills_learnt`, `description_of_work`. JSONB is more likely for PostgreSQL. |
| department        | `TEXT` or `VARCHAR(255)` | NO       |             |                      | Inserted (`logbookRoutes.js:38`). Used in PDF (`utils.js:49`). |
| student_name      | `TEXT` or `VARCHAR(255)` | NO       |             |                      | Inserted (`logbookRoutes.js:38`). Used in PDF (`utils.js:37`). |
| school            | `TEXT` or `VARCHAR(255)` | NO       |             |                      | Inserted (`logbookRoutes.js:38`). |
| supervisor_comments | `TEXT`                 | YES      |             |                      | Updated via separate endpoint (`logbookRoutes.js:113`). Defaults to NULL or empty. Referenced with fallback in PDF (`utils.js:111`). |
| supervisor_phone  | `TEXT` or `VARCHAR(50)`  | YES      |             |                      | Updated via separate endpoint (`logbookRoutes.js:135`). |
| signed_by         | `TEXT` or `VARCHAR(255)` | YES      |             |                      | Updated via separate endpoint (`logbookRoutes.js:156`). Referenced with fallback in PDF (`utils.js:126`). |
| is_approved       | `BOOLEAN`                | NO       |             |                      | Set to `true` on approval (`logbookRoutes.js:174`). Used in WHERE with `= true` and `= false`. Likely DEFAULT `false`. |
| date              | `DATE` or `TIMESTAMP`    | NO       |             |                      | Used in PDF via `new Date(data.date).toDateString()` (`utils.js:55`). |

### Evidence summary

- **INSERT**: `INSERT INTO logbooks (student_id, week_number, weekly_summary, daily_logs, department, student_name, school) VALUES ($1, $2, $3, $4, $5, $6, $7)` — `logbookRoutes.js:37`
- **SELECT all**: `SELECT * FROM logbooks` — `logbookRoutes.js:71`
- **SELECT by student_id**: `SELECT * FROM logbooks WHERE student_id = $1` — `logbookRoutes.js:52`
- **SELECT by id**: `SELECT * FROM logbooks WHERE id = $1` — `logbookRoutes.js:90`, `logbookRoutes.js:326`
- **COUNT by student_id**: `SELECT COUNT(*) FROM logbooks WHERE student_id = $1` — `logbookRoutes.js:206`
- **COUNT all**: `SELECT COUNT(*) FROM logbooks` — `logbookRoutes.js:224`
- **COUNT approved by student**: `SELECT COUNT(*) FROM logbooks WHERE student_id = $1 AND is_approved = true` — `logbookRoutes.js:242`
- **COUNT approved all**: `SELECT COUNT(*) FROM logbooks WHERE is_approved = true` — `logbookRoutes.js:262`
- **COUNT unapproved by student**: `SELECT COUNT(*) FROM logbooks WHERE student_id = $1 AND is_approved = false` — `logbookRoutes.js:281`
- **COUNT unapproved all**: `SELECT COUNT(*) FROM logbooks WHERE is_approved = false` — `logbookRoutes.js:301`
- **UPDATE comments**: `UPDATE logbooks SET supervisor_comments = $1 WHERE id = $2` — `logbookRoutes.js:113`
- **UPDATE phone**: `UPDATE logbooks SET supervisor_phone = $1 WHERE id = $2` — `logbookRoutes.js:135`
- **UPDATE signed_by**: `UPDATE logbooks SET signed_by = $1 WHERE id = $2` — `logbookRoutes.js:156`
- **UPDATE is_approved**: `UPDATE logbooks SET is_approved = $1 WHERE id = $2` — `logbookRoutes.js:178`
- **DELETE**: `DELETE FROM logbooks WHERE id = $1` — `logbookRoutes.js:193`

---

## daily_logs

| Column             | Likely Type              | Nullable | Primary Key | Foreign Key          | Evidence / Notes |
|--------------------|--------------------------|----------|-------------|----------------------|------------------|
| id                 | `UUID`                   | NO       | YES         |                      | Used in WHERE clauses, validated via `isValidUUID()` (`dailyLogRoutes.js:49`, `dailyLogRoutes.js:70`). Auto-generated. |
| student_id         | `UUID`                   | NO       |             | → `members.id`       | Inserted (`dailyLogRoutes.js:36`), used in WHERE and dedup query. |
| day                | `TEXT` or `VARCHAR(50)`  | NO       |             |                      | Inserted (`dailyLogRoutes.js:36`). Represents day name (e.g. "Monday"). |
| date               | `DATE` or `TIMESTAMP`    | NO       |             |                      | Inserted (`dailyLogRoutes.js:36`). Used in dedup check. |
| week_number        | `INTEGER`                | NO       |             |                      | Inserted (`dailyLogRoutes.js:36`). Used in dedup check. |
| description_of_work| `TEXT`                   | NO       |             |                      | Inserted as `description` (`dailyLogRoutes.js:36`). Updated via PUT (`dailyLogRoutes.js:97`). |
| skills_learnt      | `TEXT`                   | NO       |             |                      | Inserted as `skillsLearnt` (`dailyLogRoutes.js:36`). Updated via PUT (`dailyLogRoutes.js:97`). |

### Evidence summary

- **INSERT**: `INSERT INTO daily_logs (student_id, day, date, week_number, description_of_work, skills_learnt) VALUES ($1, $2, $3, $4, $5, $6)` — `dailyLogRoutes.js:36`
- **SELECT all by student**: `SELECT * FROM daily_logs WHERE student_id = $1` — `dailyLogRoutes.js:55`
- **SELECT by id**: `SELECT * FROM daily_logs WHERE id = $1` — `dailyLogRoutes.js:75`
- **SELECT dedup**: `SELECT * FROM daily_logs WHERE week_number = $1 AND day = $2 AND date = $3 AND student_id = $4` — `dailyLogRoutes.js:27`
- **UPDATE**: `UPDATE daily_logs SET day = $1, date = $2, week_number = $3, description_of_work = $4, skills_learnt = $5 WHERE id = $6` — `dailyLogRoutes.js:97`
- **DELETE**: `DELETE FROM daily_logs WHERE id = $1` — `dailyLogRoutes.js:110`

---

## Relationships

```
members (1) ──────< (many) logbooks
    members.id  ←──  logbooks.student_id

members (1) ──────< (many) daily_logs
    members.id  ←──  daily_logs.student_id
```

- **logbooks.student_id** references **members.id** — foreign key relationship. A student (member) can have many logbooks. Each logbook belongs to exactly one student.
- **daily_logs.student_id** references **members.id** — foreign key relationship. A student (member) can have many daily logs. Each daily log belongs to exactly one student.
- **logbooks** and **daily_logs** are logically related (daily logs compose a weekly logbook) but there is **no direct foreign key** between them in the code. The connection is implicit via `student_id` + `week_number`.
- **daily_logs** is **not** stored as a nested relation; instead, **logbooks.daily_logs** stores a JSON/JSONB column containing the daily log data as an embedded array.

---

## UNIQUE Constraints

| Table       | Columns                                      | Evidence |
|-------------|----------------------------------------------|----------|
| members     | `email`                                      | Duplicate check before INSERT: `SELECT * FROM members WHERE email = $1` (`userRoutes.js:18`). If rows > 0, returns "User already exists". |
| daily_logs  | `(student_id, week_number, day, date)`       | Dedup check before INSERT: `SELECT * FROM daily_logs WHERE week_number = $1 AND day = $2 AND date = $3 AND student_id = $4` (`dailyLogRoutes.js:27`). If rows > 0, returns "Log already exists". |

### Likely but unconfirmed UNIQUE constraints

| Table      | Columns                        | Reasoning |
|------------|--------------------------------|-----------|
| logbooks   | `(student_id, week_number)`    | A student likely cannot submit two logbooks for the same week. However, this is NOT enforced in application code — no dedup check exists for logbook creation. May be enforced at the DB level or may be a gap. |

---

## NOT NULL Constraints

All columns listed as `Nullable: NO` above are inferred NOT NULL based on:
1. Being included in INSERT statements without indication of optional handling.
2. Being required in application-level validation (`if (!field) return 400`).
3. Being used in WHERE/JOIN conditions without NULL-safety patterns.

Columns listed as `Nullable: YES` are inferred nullable because:
1. They are updated via separate endpoints (not part of the initial INSERT).
2. They are accessed with fallback values in PDF generation (`|| "No comments yet."`, `|| "Not signed yet."`).

---

## DEFAULT Values

| Table    | Column       | Likely Default | Evidence |
|----------|--------------|----------------|----------|
| members  | role         | `'student'`    | Not included in INSERT (`userRoutes.js:27`). Checked against `'supervisor'` in `auth.js:30`. |
| logbooks | is_approved  | `false`        | Used in WHERE with `= false` for unapproved count. App sets to `true` on approval. |
| logbooks | supervisor_comments | `NULL`  | Updated separately; accessed with `|| "No comments yet."` fallback. |
| logbooks | supervisor_phone | `NULL`    | Updated separately; no default value implied. |
| logbooks | signed_by    | `NULL`         | Updated separately; accessed with `|| "Not signed yet."` fallback. |

---

## Indexes

No explicit indexes are referenced in the code. However, the following indexes would be expected based on query patterns and are listed as **inferred recommendations**:

| Table      | Suggested Index               | Query Pattern |
|------------|-------------------------------|---------------|
| members    | `UNIQUE INDEX ON email`       | `WHERE email = $1` — `userRoutes.js:18`, `userRoutes.js:57` |
| logbooks   | `INDEX ON student_id`         | `WHERE student_id = $1` — `logbookRoutes.js:52`, `logbookRoutes.js:206`, `logbookRoutes.js:242`, `logbookRoutes.js:281` |
| logbooks   | `INDEX ON is_approved`        | `WHERE is_approved = true/false` — `logbookRoutes.js:262`, `logbookRoutes.js:301` |
| daily_logs | `INDEX ON student_id`         | `WHERE student_id = $1` — `dailyLogRoutes.js:55` |
| daily_logs | `UNIQUE INDEX ON (student_id, week_number, day, date)` | Dedup query — `dailyLogRoutes.js:27` |

---

## Uncertainties

The following aspects **cannot be determined reliably** from the code alone:

1. **`members.id` generation**: Whether it uses `uuid_generate_v4()`, `gen_random_uuid()`, or application-side UUID generation. The code never inserts an `id` value, so it must be auto-generated at the DB level, but the exact function is unknown.

2. **`logbooks.id` generation**: Same uncertainty as `members.id`.

3. **`daily_logs.id` generation**: Same uncertainty as `members.id`.

4. **`logbooks.date` default**: Whether the DB has a `DEFAULT CURRENT_DATE` or `DEFAULT now()` on the `date` column. The column is in the INSERT but the value comes from the request body — the DB default is unknown.

5. **Exact VARCHAR lengths**: Whether TEXT or VARCHAR with specific lengths is used. The code treats all string fields as opaque values.

6. **`logbooks.daily_logs` column type**: Whether `JSON` or `JSONB`. JSONB is more likely for PostgreSQL (supports indexing, better performance), but the code does not perform any JSON-specific operations that would confirm this.

7. **`daily_logs` ↔ `logbooks` relationship**: Whether there is any DB-level foreign key or constraint linking these two tables. The code has no direct JOIN between them.

8. **Cascading deletes**: Whether deleting a `members` row cascades to `logbooks` and `daily_logs` rows, or whether orphaned records are possible.

9. **`members.role` possible values**: Only `'supervisor'` is explicitly checked (`auth.js:30`). Other roles (e.g. `'student'`, `'admin'`) are assumed but not verified.

10. **`logbooks.school` column**: Present in INSERT but never used elsewhere in the code. Its purpose and constraints are unclear.

11. **Database-level constraints**: Whether any triggers, check constraints, or additional constraints exist beyond what the application code reveals.

12. **`members.department` and `members.school` values**: Whether these reference separate tables (normalized) or are free-text values stored directly in the `members` table.

---

## DDL Reconstruction (Inferred)

The following SQL is an **inferred** recreation based solely on code analysis. It is **not** taken from the codebase and should be verified against the actual database.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department TEXT NOT NULL,
    school TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student'
);

CREATE TABLE logbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES members(id),
    week_number INTEGER NOT NULL,
    weekly_summary TEXT NOT NULL,
    daily_logs JSONB NOT NULL,
    department TEXT NOT NULL,
    student_name TEXT NOT NULL,
    school TEXT NOT NULL,
    supervisor_comments TEXT,
    supervisor_phone TEXT,
    signed_by TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES members(id),
    day TEXT NOT NULL,
    date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    description_of_work TEXT NOT NULL,
    skills_learnt TEXT NOT NULL
);
```

> **Warning**: This DDL is inferred from application code. It may be missing indexes, additional constraints, or may have incorrect types. Verify against the live database before using.
