const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Task routes
router.get('/:id', taskController.getSpecificTasks);
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/bulk-update', taskController.bulkUpdateTasks);
router.get('/get-report/:userId/:date', taskController.getTaskReport);


module.exports = router;