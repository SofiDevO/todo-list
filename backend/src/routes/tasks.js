const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tasks — Obtener todas las tareas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, text, completed FROM tasks ORDER BY created_at DESC'
    );
    // Convert tinyint to boolean
    const tasks = rows.map((t) => ({ ...t, completed: !!t.completed }));
    res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// POST /tasks — Crear tarea
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (text, completed) VALUES (?, 0)',
      [text.trim()]
    );
    const [rows] = await pool.execute(
      'SELECT id, text, completed FROM tasks WHERE id = ?',
      [result.insertId]
    );
    const task = { ...rows[0], completed: !!rows[0].completed };
    res.status(201).json(task);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Error creating task' });
  }
});

// PUT /tasks/:id — Marcar como completada/incompleta
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: '"completed" must be a boolean' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      [completed ? 1 : 0, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const [rows] = await pool.execute(
      'SELECT id, text, completed FROM tasks WHERE id = ?',
      [id]
    );
    const task = { ...rows[0], completed: !!rows[0].completed };
    res.json(task);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Error updating task' });
  }
});

module.exports = router;
