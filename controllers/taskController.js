const pool = require("../db");

// . Get all tasks (with optional project filtering)
const getAllTasks = async (req, res) => {
  const { userId, projectId } = req.query;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const query = `
    SELECT * FROM tasks
    WHERE user_id = $1 ${projectId ? "AND project_id = $2" : ""}
    ORDER BY date DESC
  `;

  try {
    const { rows } = await pool.query(query, projectId ? [userId, projectId] : [userId]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: `Error fetching tasks: ${err.message}` });
  }
};

// . Get specific task by ID
const getSpecificTasks = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE task_id = $1", [req.params.id]);
    rows.length ? res.json(rows[0]) : res.status(404).json({ message: "Task not found" });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

// . Create task with project association
const createTask = async (req, res) => {
  const { task_id, task_name, task_desc, date, user_id, project_id } = req.body;
  if (!task_name || !user_id) return res.status(400).json({ message: "Task name and user ID are required" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (task_id, task_name, task_desc, date, user_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [task_id, task_name, task_desc, date, user_id, project_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: `Error creating task: ${err.message}` });
  }
};

// . Update task by ID
// const updateTask = async (req, res) => {
//   const { id } = req.params;
//   const { task_name, task_desc, date, project_id, is_in_progress, is_complete } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `UPDATE tasks SET 
//         task_name = $1, task_desc = $2, date = $3,
//         project_id = $4, is_in_progress = $5, is_complete = $6
//        WHERE task_id = $7 RETURNING *`,
//       [task_name, task_desc, date, project_id, is_in_progress, is_complete, id]
//     );

//     rows.length ? res.json(rows[0]) : res.status(404).json({ message: "Task not found" });
//   } catch (err) {
//     res.status(500).json({ message: `Update failed: ${err.message}` });
//   }
// };

// . Updated updateTask Controller
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    task_name,
    task_desc,
    date,
    project_id,
    is_in_progress,
    is_complete,
    task_tags,      // . New: Update tags
    moved_to,       // . New: Update moved_to
    coming_from     // . New: Update coming_from
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET 
        task_name = $1,
        task_desc = $2,
        date = $3,
        project_id = $4,
        is_in_progress = $5,
        is_complete = $6,
        task_tags = $7,      -- . Handle task_tags
        moved_to = $8,       -- . Handle moved_to
        coming_from = $9     -- . Handle coming_from
      WHERE task_id = $10
      RETURNING *`,
      [
        task_name,
        task_desc,
        date,
        project_id,
        is_in_progress,
        is_complete,
        task_tags ?? [],      // Default to empty array if undefined
        moved_to ?? null,     // Handle null for moved_to
        coming_from ?? null,  // Handle null for coming_from
        id
      ]
    );

    rows.length
      ? res.json(rows[0])  // . Return updated task
      : res.status(404).json({ message: "Task not found" });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ message: `Update failed: ${err.message}` });
  }
  
};


// . Delete task by ID
const deleteTask = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE task_id = $1", [req.params.id]);
    rowCount ? res.json({ message: "Task deleted" }) : res.status(404).json({ message: "Task not found" });
  } catch (err) {
    res.status(500).json({ message: `Delete error: ${err.message}` });
  }
};

// . Get tasks by specific project
const getTasksByProject = async (req, res) => {
  const { user_id, project_id } = req.query;
  if (!user_id || !project_id) return res.status(400).json({ message: "User ID and Project ID are required" });

  try {
    const { rows } = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND project_id = $2 ORDER BY date DESC`,
      [user_id, project_id]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: `Error fetching tasks: ${err.message}` });
  }
};

// . Bulk update tasks
const bulkUpdateTasks = async (req, res) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ message: "Invalid or empty tasks provided" });
  }

  try {
    const updatedTasks = [];

    for (const task of tasks) {
      const { task_id, ...updates } = task;
      if (!task_id || Object.keys(updates).length === 0) continue;

      const setClause = Object.keys(updates).map((field, index) => `${field} = $${index + 1}`).join(", ");
      const updateValues = [...Object.values(updates), task_id];

      const query = `
        UPDATE tasks
        SET ${setClause}
        WHERE task_id = $${Object.keys(updates).length + 1}
        RETURNING *
      `;

      const { rows } = await pool.query(query, updateValues);
      if (rows.length) updatedTasks.push(rows[0]);
    }

    updatedTasks.length
      ? res.status(200).json({ message: "Tasks updated successfully", updated_tasks: updatedTasks })
      : res.status(400).json({ message: "No tasks were updated" });
  } catch (err) {
    res.status(500).json({ message: `Bulk update error: ${err.message}` });
  }
};

// . Get task report by user and date
const getTaskReport = async (req, res) => {
  const { userId, date } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT data FROM reports WHERE user_id = $1 AND date = $2",
      [userId, date]
    );

    rows.length
      ? res.status(200).json(rows[0].data)
      : res.status(200).json({ message: "No report found" });
  } catch (err) {
    res.status(500).json({ message: `Report fetch error: ${err.message}` });
  }
};

module.exports = {
  getAllTasks,
  getSpecificTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
  bulkUpdateTasks,
  getTaskReport,
};
