const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const tasks = [];

// Função para validar se uma task existe pelo id
function encontrarTaskIndex(id) {
  return tasks.findIndex(task => task.id === id);
}

// POST - /tasks - Criar uma task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Os campos title e description são obrigatórios.' });
  }

  const now = new Date();
  const task = {
    id: uuidv4(),
    title,
    description,
    completed_at: null,
    created_at: now,
    updated_at: now
  };

  tasks.push(task);
  return res.status(201).json(task);
});

// GET - /tasks - Listar todas as tasks, com filtro opcional por title e description
app.get('/tasks', (req, res) => {
  const { title, description } = req.query;

  let resultado = tasks;

  if (title) {
    resultado = resultado.filter(task => task.title.toLowerCase().includes(title.toLowerCase()));
  }

  if (description) {
    resultado = resultado.filter(task => task.description.toLowerCase().includes(description.toLowerCase()));
  }

  return res.json(resultado);
});

// PUT - /tasks/:id - Atualizar title e/ou description da task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const index = encontrarTaskIndex(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task não encontrada.' });
  }

  if (!title && !description) {
    return res.status(400).json({ error: 'Deve enviar title e/ou description para atualizar.' });
  }

  if (title) {
    tasks[index].title = title;
  }
  if (description) {
    tasks[index].description = description;
  }
  tasks[index].updated_at = new Date();

  return res.json(tasks[index]);
});

// DELETE - /tasks/:id - Remover uma task pelo id
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const index = encontrarTaskIndex(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task não encontrada.' });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

// PATCH - /tasks/:id/complete - Marcar ou desmarcar task como completa
app.patch('/tasks/:id/complete', (req, res) => {
  const { id } = req.params;

  const index = encontrarTaskIndex(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task não encontrada.' });
  }

  if (tasks[index].completed_at) {
    tasks[index].completed_at = null;
  } else {
    tasks[index].completed_at = new Date();
  }
  tasks[index].updated_at = new Date();

  return res.json(tasks[index]);
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
