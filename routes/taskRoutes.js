const express = require('express');
const {
  getAllTasks,
  getSpecificTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
  bulkUpdateTasks,
  getTaskReport
} = require('../controllers/taskController');  

const router = express.Router();

// router.get("/by-project", getTasksByProject);  
router.get('/:id', getSpecificTasks);
router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/bulk-update', bulkUpdateTasks);
router.get('/get-report/:userId/:date', getTaskReport);

module.exports = router;
