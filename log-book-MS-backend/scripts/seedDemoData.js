require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("../db/db");

const school = "kca";
const department = "infrastructure";
const studentEmail = "student.demo@logbookms.test";
const supervisorEmail = "supervisor.demo@logbookms.test";
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getWeekDates(weeksAgo) {
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday - weeksAgo * 7);

  return weekdays.map((day, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return { day, date: date.toISOString().slice(0, 10) };
  });
}

async function findOrCreateMember(client, { name, email, password, role }) {
  const existing = await client.query(
    "SELECT id FROM members WHERE email = $1",
    [email]
  );
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing.rows.length > 0) {
    const result = await client.query(
      `UPDATE members
       SET name = $1, password = $2, department = $3, school = $4, role = $5
       WHERE id = $6
       RETURNING id`,
      [name, passwordHash, department, school, role, existing.rows[0].id]
    );
    return result.rows[0].id;
  }

  const result = await client.query(
    `INSERT INTO members (name, email, password, department, school, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [name, email, passwordHash, department, school, role]
  );
  return result.rows[0].id;
}

async function insertWeek(client, studentId, weekNumber, weeksAgo, isApproved) {
  const entries = getWeekDates(weeksAgo).map(({ day, date }, index) => ({
    day,
    date,
    weekNumber,
    description:
      [
        "Set up the development environment and reviewed the project requirements.",
        "Created responsive interface components and tested them with sample data.",
        "Connected application forms to the API and handled validation errors.",
        "Added database queries and checked role-based application workflows.",
        "Reviewed the week's work, fixed issues, and prepared a progress update.",
      ][index],
    skillsLearnt:
      [
        "Development environment setup and requirements analysis",
        "Responsive UI development and component reuse",
        "API integration and form validation",
        "SQL queries and access-control concepts",
        "Testing, debugging, and technical communication",
      ][index],
  }));

  for (const entry of entries) {
    await client.query(
      `INSERT INTO daily_logs
       (student_id, day, date, week_number, description_of_work, skills_learnt)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        studentId,
        entry.day,
        entry.date,
        entry.weekNumber,
        entry.description,
        entry.skillsLearnt,
      ]
    );
  }

  const summary = isApproved
    ? "Completed an introductory week focused on understanding the workplace, setting up tools, and learning the team's development workflow."
    : "Applied the team's workflow to build interface features, connect API requests, and practice testing and debugging.";

  await client.query(
    `INSERT INTO logbooks
     (student_id, week_number, weekly_summary, daily_logs, department,
      student_name, school, supervisor_comments, supervisor_phone, signed_by,
      is_approved, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      studentId,
      weekNumber,
      summary,
      JSON.stringify(entries),
      department,
      "Demo Student",
      school,
      isApproved ? "Good progress. Continue documenting the skills practiced." : null,
      isApproved ? "+254 700 000 000" : null,
      isApproved ? "Demo Supervisor" : null,
      isApproved,
      entries[entries.length - 1].date,
    ]
  );
}

async function seedDemoData() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    throw new Error("Set SEED_DEMO_DATA=true to confirm demo data seeding.");
  }

  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    throw new Error("Configure DATABASE_URL or the DB_* variables first.");
  }

  const studentPassword = process.env.DEMO_STUDENT_PASSWORD;
  const supervisorPassword = process.env.DEMO_SUPERVISOR_PASSWORD;
  if (!studentPassword || !supervisorPassword) {
    throw new Error(
      "Set DEMO_STUDENT_PASSWORD and DEMO_SUPERVISOR_PASSWORD before seeding."
    );
  }
  if (studentPassword.length < 12 || supervisorPassword.length < 12) {
    throw new Error("Demo passwords must each be at least 12 characters.");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const studentId = await findOrCreateMember(client, {
      name: "Demo Student",
      email: studentEmail,
      password: studentPassword,
      role: "student",
    });

    await findOrCreateMember(client, {
      name: "Demo Supervisor",
      email: supervisorEmail,
      password: supervisorPassword,
      role: "supervisor",
    });

    await client.query("DELETE FROM logbooks WHERE student_id = $1", [studentId]);
    await client.query("DELETE FROM daily_logs WHERE student_id = $1", [studentId]);
    await insertWeek(client, studentId, 1, 2, true);
    await insertWeek(client, studentId, 2, 1, false);
    await client.query("COMMIT");

    console.log("Demo data seeded successfully.");
    console.log(`Student login email: ${studentEmail}`);
    console.log(`Supervisor login email: ${supervisorEmail}`);
    console.log("Use the passwords configured in DEMO_*_PASSWORD.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

seedDemoData().catch((error) => {
  console.error("Demo data seeding failed:", error.message);
  process.exitCode = 1;
});
