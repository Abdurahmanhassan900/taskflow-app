const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const serializeTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  status: STATUS_LABELS[task.status] || task.status,
  priority: PRIORITY_LABELS[task.priority] || task.priority,
  statusValue: task.status,
  priorityValue: task.priority,
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

module.exports = { serializeTask, STATUS_LABELS, PRIORITY_LABELS };
