const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

//   Fetch all projects for a user
const getUserProjects = async (req, res) => {
  const { userId } = req.params;

  try {
    const projects = await pool.query(
      `SELECT p.*, 
        COUNT(t.task_id) AS total_tasks,
        COUNT(CASE WHEN t.is_complete THEN 1 END) AS completed_tasks
       FROM projects p
       LEFT JOIN tasks t ON p.project_id = t.project_id
       WHERE p.user_id = $1
       GROUP BY p.project_id
       ORDER BY p.created_at ASC`,
      [userId]
    );

    res.status(200).json(projects.rows);
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

//   Create a new project for the user
const createProject = async (req, res) => {
  const { project_name, user_id } = req.body;

  if (!project_name || !user_id) {
    return res.status(400).json({ message: "Project name and user ID are required." });
  }

  try {
    const existingProject = await pool.query(
      "SELECT * FROM projects WHERE project_name = $1 AND user_id = $2",
      [project_name, user_id]
    );

    if (existingProject.rows.length > 0) {
      return res.status(409).json({ message: "Project with this name already exists." });
    }

    const newProject = await pool.query(
      `INSERT INTO projects (project_id, project_name, user_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [uuidv4(), project_name.trim(), user_id]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error("Error creating project:", err.message);
    res.status(500).json({ message: "Failed to create project" });
  }
};

//   Get a project by ID (with task stats)
const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await pool.query(
      `SELECT p.*, 
        COUNT(t.task_id) AS total_tasks,
        COUNT(CASE WHEN t.is_complete THEN 1 END) AS completed_tasks
       FROM projects p
       LEFT JOIN tasks t ON p.project_id = t.project_id
       WHERE p.project_id = $1
       GROUP BY p.project_id`,
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project.rows[0]);
  } catch (err) {
    console.error("Error fetching project:", err.message);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};

//   Delete a project & reassign tasks to General Project
const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectRes = await client.query(
      "SELECT * FROM projects WHERE project_id = $1 AND user_id = $2",
      [projectId, user_id]
    );

    if (projectRes.rows.length === 0) throw new Error("Project not found");
    if (projectRes.rows[0].project_name === "General Project") {
      throw new Error("Cannot delete General Project");
    }

    const generalProject = await client.query(
      "SELECT project_id FROM projects WHERE project_name = 'General Project' AND user_id = $1",
      [user_id]
    );

    if (generalProject.rows.length === 0) throw new Error("General Project not found");

    await client.query(
      "UPDATE tasks SET project_id = $1 WHERE project_id = $2",
      [generalProject.rows[0].project_id, projectId]
    );

    await client.query("DELETE FROM projects WHERE project_id = $1", [projectId]);

    await client.query("COMMIT");
    res.status(200).json({ message: "Project deleted and tasks reassigned." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting project:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

//   Get all tasks for a project
const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await pool.query(
      `SELECT * FROM tasks WHERE project_id = $1 ORDER BY date DESC`,
      [projectId]
    );
    res.status(200).json(tasks.rows);
  } catch (err) {
    console.error("Error fetching project tasks:", err.message);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

module.exports = {
  getUserProjects,
  createProject,
  getProjectById,
  deleteProject,
  getProjectTasks,
};
