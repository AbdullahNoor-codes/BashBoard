const express = require("express");
const {
  getUserProjects,
  createProject,
  getProjectById,
  deleteProject,
  getProjectTasks,
} = require("../controllers/projectControllers");

const router = express.Router();

//   Fetch all projects for a user
router.get("/user/:userId", getUserProjects);

//   Create a new project
router.post("/", createProject);

//   Get details of a project (with task counts)
router.get("/:projectId", getProjectById);

//   Delete a project (reassign tasks to General Project)
router.delete("/:projectId", deleteProject);

//   Get all tasks associated with a project
router.get("/:projectId/tasks", getProjectTasks);

module.exports = router;
