const express = require("express");
const dailyLogRouter = express.Router();
const db = require("../../db/db");
const {
  authenticateUser,
} = require("../../utils/auth");
const { isValidUUID } = require("../../utils/helperFunctions");

//* add a new daily_log to the database
dailyLogRouter.post("/add", authenticateUser, async (req, res) => {
  const { day, date, weekNumber, description, skillsLearnt } =
    req.body;
  const studentId = req.user.id;

  if (
    !day ||
    !date ||
    !weekNumber ||
    !description ||
    !skillsLearnt
  ) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  //* If weekNumber, day, date and studentId already exists, return an error
  try {
    const log = await db.query(
      "SELECT id FROM daily_logs WHERE week_number = $1 AND day = $2 AND date = $3 AND student_id = $4",
      [weekNumber, day, date, studentId]
    );
    if (log.rows.length > 0) {
      return res.status(409).json({ message: "Log already exists" });
    }

    await db.query(
      "INSERT INTO daily_logs (student_id, day, date, week_number, description_of_work, skills_learnt) VALUES ($1, $2, $3, $4, $5, $6)",
      [studentId, day, date, weekNumber, description, skillsLearnt]
    );
    res.status(200).json({ message: "Logbook created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Get all daily logs for a particular student
dailyLogRouter.get("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  if (req.user.role !== "supervisor" && req.user.id !== id) {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const dailyLogs = await db.query(
      "SELECT * FROM daily_logs WHERE student_id = $1",
      [id]
    );
    res.status(200).json({
      data: dailyLogs.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Get a particular daily log from the database by id
dailyLogRouter.get("/daily-log/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const ownership = req.user.role === "supervisor"
      ? "WHERE id = $1"
      : "WHERE id = $1 AND student_id = $2";
    const params = req.user.role === "supervisor" ? [id] : [id, req.user.id];
    const dailyLog = await db.query(`SELECT * FROM daily_logs ${ownership}`, params);
    if (dailyLog.rows.length === 0) {
      return res.status(404).json({ message: "Daily log not found" });
    }
    res.status(200).json({
      data: dailyLog.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Update a particular daily_log from the database by id
dailyLogRouter.put("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  const { day, date, weekNumber, description, skillsLearnt } = req.body;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (!day || !date || !weekNumber || !description || !skillsLearnt) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const ownership = req.user.role === "supervisor"
      ? "id = $6"
      : "id = $6 AND student_id = $7";
    const params = req.user.role === "supervisor"
      ? [day, date, weekNumber, description, skillsLearnt, id]
      : [day, date, weekNumber, description, skillsLearnt, id, req.user.id];
    const result = await db.query(
      `UPDATE daily_logs SET day = $1, date = $2, week_number = $3, description_of_work = $4, skills_learnt = $5 WHERE ${ownership}`,
      params
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Daily log not found" });
    }
    res.status(200).json({ message: "Daily log updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Delete a particular daily_log from the database by id
dailyLogRouter.delete("/:id", authenticateUser, async (req, res) => {
  const id = req.params.id;
  if (!isValidUUID(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const ownership = req.user.role === "supervisor"
      ? "WHERE id = $1"
      : "WHERE id = $1 AND student_id = $2";
    const params = req.user.role === "supervisor" ? [id] : [id, req.user.id];
    const result = await db.query(`DELETE FROM daily_logs ${ownership}`, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Daily log not found" });
    }
    res.status(200).json({ message: "Daily log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = dailyLogRouter;
