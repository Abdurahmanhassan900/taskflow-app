const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { validate, validateParams } = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');
const { uuidParamSchema } = require('../schemas/admin.schema');
const tasks = require('../controllers/tasksController');

const router = express.Router();

router.use(authenticate);

router.get('/', tasks.listTasks);
router.post('/', validate(createTaskSchema), tasks.createTask);
router.get('/:id', validateParams(uuidParamSchema), tasks.getTask);
router.put('/:id', validateParams(uuidParamSchema), validate(updateTaskSchema), tasks.updateTask);
router.delete('/:id', validateParams(uuidParamSchema), tasks.deleteTask);

module.exports = router;
