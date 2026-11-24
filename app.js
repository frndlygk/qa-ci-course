const express = require('express');

const app = express();
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
  res.status(200).json({ status: 'ok' });
});

app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
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

module.exports = { app, resetTasks };