const express = require("express");
const userRouter = express.Router();
const db = require("../../db/db");
const { createToken } = require("../../utils/auth");
const bcrypt = require("bcrypt");

//* Register a new user
userRouter.post("/register", async (req, res) => {
  const { name, email, password, department, school } = req.body;

  if (!name || !email || !password || !department || !school) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const existingUser = await db.query("SELECT id FROM members WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    await db.query(
      "INSERT INTO members (name, email, password, department, school) VALUES ($1, $2, $3, $4, $5)",
      [name, email, hashedPass, department, school]
    );
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//* Login a user
userRouter.post("/login", async (req, res) => {
  const { email, password, department, school } = req.body;

  if (!email || !password || !department || !school) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const user = await db.query(
      "SELECT * FROM members WHERE email = $1 AND department = $2 AND school = $3",
      [email, department, school]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPass = await bcrypt.compare(password, user.rows[0].password);

    if (!validPass) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user.rows[0]);

    const { password: pass, ...rest } = user.rows[0];

    res.status(200).json({ message: "Login successful", token, user: rest });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
});

module.exports = userRouter;
