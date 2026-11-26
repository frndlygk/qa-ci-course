const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [];
let nextId = 1;

function resetTasks() {
  tasks = [
    { id: 1, title: 'Изучить Git flow', done: false },
    { id: 2, title: 'Написать первый API тест', done: false }
  ];
  nextId = 3;
}

resetTasks();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    env: process.env.APP_ENV || 'local'
  });
});

app.post('/reset', (req, res) => {
  if (process.env.APP_ENV === 'prod') {
    return res.status(403).json({ error: 'Reset is forbidden in prod' });
  }

  resetTasks();
  return res.status(204).send();
});

app.get('/tasks', (req, res) => {
  const { done } = req.query;

  if (done === undefined) {
    return res.status(200).json({ items: tasks });
  }

  if (done !== 'true' && done !== 'false') {
    return res.status(400).json({ error: 'Query param "done" must be "true" or "false"' });
  }

  const isDone = done === 'true';
  const filtered = tasks.filter((t) => t.done === isDone);
  return res.status(200).json({ items: filtered });
});

app.get('/tasks/stats', (req, res) => {
  const completed = tasks.filter((t) => t.done === true).length;
  res.status(200).json({
    total: tasks.length,
    completed,
    pending: tasks.length - completed
  });
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Field "title" is required' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

app.patch('/tasks/:id/done', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.done = true;
  return res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

module.exports = { app, resetTasks };