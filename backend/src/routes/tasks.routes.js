const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');
const tasks = require('../controllers/tasks.controller');

const router = express.Router();

// Every task route requires a valid access token.
router.use(authenticate);

router.get('/', tasks.listTasks);
router.post('/', validate(createTaskSchema), tasks.createTask);
router.get('/:id', tasks.getTask);
router.put('/:id', validate(updateTaskSchema), tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

module.exports = router;
