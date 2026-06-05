const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
};

export const createTask = async (text) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
};

export const updateTask = async (id, completed) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
};
