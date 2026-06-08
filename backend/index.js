const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

let nextId = 4;
const tasks = [
  { id: 1, title: 'Set up local dev environment', completed: true },
  { id: 2, title: 'Review project requirements', completed: false },
  { id: 3, title: 'Build MVP task list', completed: false },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', (_req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const title = req.body?.title?.trim();
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const task = { id: nextId++, title, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (typeof req.body.completed === 'boolean') {
    task.completed = req.body.completed;
  }

  if (req.body.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!title) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    task.title = title;
  }

  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`TaskFlow MVP API running at http://localhost:${PORT}`);
});
