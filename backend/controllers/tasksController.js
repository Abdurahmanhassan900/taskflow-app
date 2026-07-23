const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { serializeTask } = require('../utils/taskSerializer');

const activeTaskFilter = (userId) => ({
  userId,
  deletedAt: null,
});

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: activeTaskFilter(req.user.id),
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks.map(serializeTask));
});

const getTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, ...activeTaskFilter(req.user.id) },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.json(serializeTask(task));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      status,
      priority,
      userId: req.user.id,
    },
  });

  res.status(201).json(serializeTask(task));
});

const updateTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, ...activeTaskFilter(req.user.id) },
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json(serializeTask(task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, ...activeTaskFilter(req.user.id) },
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  await prisma.task.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'Task deleted successfully' });
});

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
