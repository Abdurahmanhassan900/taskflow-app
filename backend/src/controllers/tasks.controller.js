const { prisma } = require('../prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

// Every query is scoped to req.user.id. This is what prevents IDOR: a user can
// only ever read or change tasks where userId === their own id.
const listTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  res.json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority } = req.body;
  const task = await prisma.task.create({
    data: { title, description, status, priority, userId: req.user.id },
  });
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  // updateMany returns a count, so it lets us update only when the row is
  // owned by this user without first fetching it.
  const result = await prisma.task.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: req.body,
  });
  if (result.count === 0) {
    throw new ApiError(404, 'Task not found');
  }
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const result = await prisma.task.deleteMany({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (result.count === 0) {
    throw new ApiError(404, 'Task not found');
  }
  res.json({ message: 'Task deleted successfully' });
});

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
