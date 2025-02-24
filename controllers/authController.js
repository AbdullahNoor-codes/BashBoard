const pool = require("../db");

// Ensure General Project exists
const ensureGeneralProject = async (userId) => {
  try {
    const { rows } = await pool.query(
      "SELECT project_id FROM projects WHERE project_name = 'General Project' AND user_id = $1",
      [userId]
    );

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO projects (project_name, user_id) VALUES ('General Project', $1)",
        [userId]
      );
      console.log(`General Project created for user: ${userId}`);
    } else {
      console.log(`General Project already exists for user: ${userId}`);
    }
  } catch (err) {
    console.error(`Error ensuring General Project for user ${userId}:`, err.message);
  }
};

// Login function
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log("Login route called");
  console.log(`Username: ${username}, Password: ${password}`);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    const user = rows[0];

    if (!user) {
      console.warn("Invalid username or password");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log(`User found: ${user.username} (ID: ${user.user_id})`);

    // Ensure "General Project" exists
    await ensureGeneralProject(user.user_id);

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(`Login error: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, ensureGeneralProject };
