# Log-Book Management System - Backend

A RESTful API backend for managing academic/internship logbooks. Students can submit weekly work logs, and supervisors can review, comment on, and approve them — with PDF report generation built in.

**Author:** Eric Kariuki

---

## Overview

The Log-Book Management System (MS) is designed for academic institutions and internship programs where students are required to maintain weekly logs of their work activities. The system streamlines the process of:

- Students recording daily work activities (skills learnt, descriptions of work)
- Compiling daily entries into weekly logbook summaries
- Supervisors reviewing, commenting on, and approving submitted logbooks
- Generating professional PDF reports of completed logbooks

This backend serves as the API layer, handling authentication, data persistence (PostgreSQL), and PDF generation.

---

## Features

### Student Features
- **User Registration & Authentication** — Secure account creation with bcrypt-hashed passwords and JWT-based sessions
- **Daily Log Management** — Create, view, update, and delete daily work entries with deduplication checks
- **Weekly Logbook Submission** — Compile daily logs into weekly summaries with a single submission
- **Logbook Viewing** — Access all personal logbooks and track approval status
- **PDF Export** — Download any logbook as a formatted PDF report

### Supervisor Features
- **Admin Dashboard** — View all submitted logbooks across all students
- **Logbook Review** — Add supervisor comments, phone number, and signature to any logbook
- **Approval Workflow** — Approve or track unapproved logbooks
- **Statistics** — Count total, approved, and unapproved logbooks (per student or globally)

### System Features
- **JWT Authentication** — Secure token-based auth with role-based access control (student/supervisor)
- **Email Notifications** — Send emails via Gmail SMTP integration
- **CORS Support** — Cross-origin requests enabled for frontend integration
- **Request Logging** — HTTP request logging via Morgan

---

## Tech Stack

| Layer              | Technology         | Version   |
|--------------------|--------------------|-----------|
| Runtime            | Node.js            | v18+      |
| Web Framework      | Express.js         | ^4.21.2   |
| Database           | PostgreSQL         | via `pg`  |
| Authentication     | JWT                | ^9.0.2    |
| Password Hashing   | bcrypt             | ^5.1.1    |
| PDF Generation     | PDFKit + pdfkit-table | ^0.16.0 / ^0.1.99 |
| Email              | Nodemailer         | ^9.0.3    |
| Dev Server         | Nodemon            | ^3.1.9    |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** running locally (default port 5432)
- A **Gmail account** with an App Password (for the email feature)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd log-book-MS-backend

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PORT=5432
DB_PASSWORD=your_postgres_password
DB_NAME=logbookMS

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (optional — required only for email feature)
EMAIL=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### Database Setup

Create the PostgreSQL database and tables:

```sql
CREATE DATABASE "logbookMS";
```

Then create the required tables (see [Database Schema](#database-schema) below for the full DDL).

### Running the Server

```bash
# Start with auto-reload (development)
npm start

# The server runs on http://localhost:8000
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

Most endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned on successful login and expire after 1 day.

### Users (`/api/users`)

| Method | Endpoint              | Auth | Description                        |
|--------|-----------------------|------|------------------------------------|
| POST   | `/register`           | No   | Register a new user                |
| POST   | `/login`              | No   | Login and receive a JWT token      |

### Daily Logs (`/api/daily-logs`)

| Method | Endpoint              | Auth | Description                        |
|--------|-----------------------|------|------------------------------------|
| POST   | `/add`                | Yes  | Create a daily log entry           |
| GET    | `/:id`                | Yes  | Get all daily logs for a student   |
| GET    | `/daily-log/:id`      | Yes  | Get a single daily log by ID       |
| PUT    | `/:id`                | Yes  | Update a daily log                 |
| DELETE | `/:id`                | Yes  | Delete a daily log                 |

### Logbooks (`/api/logbooks`)

| Method | Endpoint                                      | Auth     | Role       | Description                        |
|--------|-----------------------------------------------|----------|------------|------------------------------------|
| POST   | `/add`                                        | Yes      | Any        | Create a weekly logbook            |
| GET    | `/:studentId`                                 | Yes      | Any        | Get all logbooks for a student     |
| GET    | `/logbook/:logbookId`                         | Yes      | Any        | Get a single logbook               |
| GET    | `/total/:studentId`                           | Yes      | Any        | Count logbooks for a student       |
| GET    | `/approved/:studentId`                        | Yes      | Any        | Count approved logbooks            |
| GET    | `/unapproved/:studentId`                      | Yes      | Any        | Count unapproved logbooks          |
| GET    | `/logbook/pdf/:logbookId`                     | Yes      | Any        | Download logbook as PDF            |
| GET    | `/admin/logbooks`                             | Yes      | Supervisor | Get all logbooks (admin)           |
| GET    | `/admin/logbooks/total`                       | Yes      | Supervisor | Count all logbooks                 |
| GET    | `/admin/logbooks/approved`                    | Yes      | Supervisor | Count all approved logbooks        |
| GET    | `/admin/logbooks/unapproved`                  | Yes      | Supervisor | Count all unapproved logbooks      |
| PUT    | `/admin/logbook/comments/:id`                 | Yes      | Supervisor | Update supervisor comments         |
| PUT    | `/admin/logbook/supervisor-phone/:id`         | Yes      | Supervisor | Update supervisor phone            |
| PUT    | `/admin/logbook/signedby/:id`                 | Yes      | Supervisor | Update signed-by field             |
| PUT    | `/admin/logbook/approve/:id`                  | Yes      | Supervisor | Approve a logbook                  |
| DELETE | `/logbook/:id`                                | Yes      | Any        | Delete a logbook                   |
| POST   | `/send-email`                                 | Yes      | Any        | Send an email via SMTP             |

---

## Database Schema

The system uses **PostgreSQL** with three tables:

### Tables

```
members (1) ──────< (many) logbooks
    members.id  ←──  logbooks.student_id

members (1) ──────< (many) daily_logs
    members.id  ←──  daily_logs.student_id
```

### members

| Column     | Type      | Constraints         | Description                  |
|------------|-----------|---------------------|------------------------------|
| id         | UUID      | PK, auto-generated  | Unique user identifier       |
| name       | TEXT      | NOT NULL            | Full name                    |
| email      | TEXT      | NOT NULL, UNIQUE    | Email address                |
| password   | VARCHAR   | NOT NULL            | Bcrypt hashed password       |
| department | TEXT      | NOT NULL            | Department name              |
| school     | TEXT      | NOT NULL            | School/institution name      |
| role       | TEXT      | NOT NULL, DEFAULT 'student' | User role (student/supervisor) |

### logbooks

| Column              | Type      | Constraints              | Description                    |
|---------------------|-----------|--------------------------|--------------------------------|
| id                  | UUID      | PK, auto-generated       | Unique logbook identifier      |
| student_id          | UUID      | FK → members.id          | Owner of the logbook           |
| week_number         | INTEGER   | NOT NULL                 | Week number of the logbook     |
| weekly_summary      | TEXT      | NOT NULL                 | Summary of the week's work     |
| daily_logs          | JSONB     | NOT NULL                 | Embedded daily log entries     |
| department          | TEXT      | NOT NULL                 | Department name                |
| student_name        | TEXT      | NOT NULL                 | Student's full name            |
| school              | TEXT      | NOT NULL                 | School/institution name        |
| supervisor_comments | TEXT      | Nullable                 | Supervisor's feedback          |
| supervisor_phone    | TEXT      | Nullable                 | Supervisor's phone number      |
| signed_by           | TEXT      | Nullable                 | Supervisor's signature name    |
| is_approved         | BOOLEAN   | NOT NULL, DEFAULT false  | Approval status                |
| date                | DATE      | NOT NULL                 | Submission date                |

### daily_logs

| Column              | Type      | Constraints              | Description                    |
|---------------------|-----------|--------------------------|--------------------------------|
| id                  | UUID      | PK, auto-generated       | Unique entry identifier        |
| student_id          | UUID      | FK → members.id          | Owner of the entry             |
| day                 | TEXT      | NOT NULL                 | Day name (e.g., "Monday")      |
| date                | DATE      | NOT NULL                 | Date of the entry              |
| week_number         | INTEGER   | NOT NULL                 | Week number                    |
| description_of_work | TEXT      | NOT NULL                 | What was done                  |
| skills_learnt       | TEXT      | NOT NULL                 | Skills acquired                |

### Inferred DDL

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

> **Note:** This DDL is inferred from application code and should be verified against the live database.

---

## Project Structure

```
log-book-MS-backend/
├── app.js                    # Entry point — Express setup, route mounting, server start
├── db/
│   └── db.js                 # PostgreSQL connection pool (pg.Pool)
├── routes/
│   ├── userRoutes/
│   │   └── userRoutes.js     # Registration and login endpoints
│   ├── dailyLogRoutes/
│   │   └── dailyLogRoutes.js # Daily log CRUD operations
│   └── logBookRoutes/
│       └── logbookRoutes.js  # Logbook CRUD + admin actions + PDF + email
├── utils/
│   ├── auth.js               # JWT creation, authentication & authorization middleware
│   ├── helperFunctions.js    # UUID validation utility
│   └── utils.js              # PDF generation with pdfkit-table
├── services/
│   └── emailService.js       # Nodemailer email sending service
├── .env                      # Environment variables (not committed)
├── .gitignore
├── package.json
└── DATABASE_SCHEMA.md        # Detailed schema documentation
```

### Key Architectural Notes

- **No separate controllers** — Route handlers contain all business logic inline (validation, DB queries, responses)
- **Parameterized SQL** — All database queries use parameterized inputs (`$1`, `$2`, etc.) to prevent SQL injection
- **Connection pooling** — Uses `pg.Pool` for efficient PostgreSQL connection management
- **JWT payload** — Contains `{ id, email, role }` with a 1-day expiration

---

## Authentication & Authorization

### How It Works

1. **Register** — Create an account with name, email, password, department, and school
2. **Login** — Submit credentials to receive a JWT token
3. **Request** — Include the token in the `Authorization: Bearer <token>` header for protected endpoints

### Roles

| Role       | Access                                                   |
|------------|----------------------------------------------------------|
| student    | Register, manage own logs/logbooks, view/download PDFs   |
| supervisor | All student access + view all logbooks, comment, approve |

### Middleware

- `authenticateUser` — Verifies JWT token and attaches user info to `req.user`
- `isSupervisor` — Restricts access to supervisor-role users only

---

## Environment Variables

| Variable         | Required | Description                                |
|------------------|----------|--------------------------------------------|
| `DB_HOST`        | Yes      | PostgreSQL host (e.g., `localhost`)        |
| `DB_USER`        | Yes      | PostgreSQL username                        |
| `DB_PORT`        | Yes      | PostgreSQL port (e.g., `5432`)             |
| `DB_PASSWORD`    | Yes      | PostgreSQL password                        |
| `DB_NAME`        | Yes      | Database name (`logbookMS`)                |
| `JWT_SECRET`     | Yes      | Secret key for signing JWT tokens          |
| `EMAIL`          | No       | Gmail address for Nodemailer               |
| `EMAIL_PASSWORD` | No       | Gmail App Password for Nodemailer          |

---

## License

This project is for academic use. Contact the author for licensing details.
