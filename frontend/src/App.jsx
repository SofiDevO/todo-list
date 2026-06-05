import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask } from './api';

// ─── Icons ───────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 opacity-20">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// ─── Task Item ────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(task.id, !task.completed);
    setToggling(false);
  };

  return (
    <li className={`
      group flex items-center gap-4 px-5 py-4 rounded-2xl
      transition-all duration-300 cursor-pointer
      border border-transparent hover:border-white/5
      ${task.completed
        ? 'bg-white/3 opacity-60'
        : 'bg-white/5 hover:bg-white/8'
      }
    `}
      onClick={handleToggle}
      id={`task-${task.id}`}
    >
      {/* Checkbox */}
      <button
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-300
          ${task.completed
            ? 'bg-violet-500 border-violet-500 text-white'
            : 'border-white/20 group-hover:border-violet-400 text-transparent'
          }
          ${toggling ? 'scale-90 opacity-70' : 'scale-100'}
        `}
        aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        disabled={toggling}
      >
        {toggling ? (
          <span className="w-3 h-3 rounded-full bg-current animate-pulse" />
        ) : (
          <CheckIcon />
        )}
      </button>

      {/* Text */}
      <span className={`
        flex-1 text-sm font-medium leading-relaxed transition-all duration-300
        ${task.completed ? 'line-through text-white/30' : 'text-white/80'}
      `}>
        {task.text}
      </span>

      {/* Badge */}
      {task.completed && (
        <span className="text-xs text-violet-400/60 font-medium tracking-wide">
          ✓ hecho
        </span>
      )}
    </li>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonItem() {
  return (
    <li className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/3 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
      <div className="flex-1 h-4 rounded-full bg-white/10" style={{ width: `${40 + Math.random() * 40}%` }} />
    </li>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const pending = tasks.filter((t) => !t.completed).length;
  const done    = tasks.filter((t) =>  t.completed).length;

  // Initial fetch
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setAdding(true);
    try {
      const newTask = await createTask(text);
      setTasks((prev) => [newTask, ...prev]);
      setInput('');
      setError(null);
    } catch {
      setError('Error al agregar la tarea.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const updated = await updateTask(id, completed);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError('Error al actualizar la tarea.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ background: 'radial-gradient(ellipse at 60% 0%, #1e1040 0%, #0f0f13 60%)' }}
    >
      {/* Header */}
      <header className="w-full max-w-lg mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Todo App
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          ❤️ Todo List ❤️
        </h1>
        <p className="text-white/40 text-sm">
          {loading ? 'Cargando…' : `${pending} pendiente${pending !== 1 ? 's' : ''} · ${done} completada${done !== 1 ? 's' : ''}`}
        </p>
      </header>

      {/* Card */}
      <main className="w-full max-w-lg flex flex-col gap-4">

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
          >
            <span className="text-base">⚠</span>
            {error}
            <button
              className="ml-auto text-red-300/60 hover:text-red-300 transition-colors"
              onClick={() => setError(null)}
              aria-label="Cerrar error"
            >✕</button>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleAdd}
          id="add-task-form"
          className="flex gap-3"
        >
          <input
            id="task-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Añadir nueva tarea…"
            disabled={adding}
            maxLength={500}
            autoComplete="off"
            className="
              flex-1 px-5 py-3.5 rounded-2xl text-sm font-medium
              bg-white/5 border border-white/10
              placeholder-white/25 text-white
              focus:outline-none focus:border-violet-500/50 focus:bg-white/8
              disabled:opacity-50
              transition-all duration-200
            "
          />
          <button
            type="submit"
            id="add-task-btn"
            disabled={adding || !input.trim()}
            className="
              flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0
              bg-violet-600 hover:bg-violet-500
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white transition-all duration-200
              active:scale-95 shadow-lg shadow-violet-900/40
            "
            aria-label="Agregar tarea"
          >
            {adding ? <SpinnerIcon /> : <PlusIcon />}
          </button>
        </form>

        {/* Task List */}
        <div
          className="
            rounded-3xl border border-white/5 overflow-hidden
            bg-[#13131e]/80 backdrop-blur-sm
          "
        >
          {loading ? (
            <ul className="flex flex-col gap-2 p-3">
              {[1, 2, 3].map((i) => <SkeletonItem key={i} />)}
            </ul>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
              <ListIcon />
              <p className="text-sm font-medium">Sin tareas todavía</p>
              <p className="text-xs">Agrega tu primera tarea arriba ↑</p>
            </div>
          ) : (
            <>
              {/* Pending tasks */}
              {tasks.filter((t) => !t.completed).length > 0 && (
                <section>
                  <p className="px-5 pt-5 pb-2 text-xs font-semibold tracking-widest uppercase text-white/20">
                    Pendientes
                  </p>
                  <ul className="flex flex-col gap-1.5 px-3 pb-3">
                    {tasks
                      .filter((t) => !t.completed)
                      .map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                      ))}
                  </ul>
                </section>
              )}

              {/* Completed tasks */}
              {tasks.filter((t) => t.completed).length > 0 && (
                <section className="border-t border-white/5">
                  <p className="px-5 pt-5 pb-2 text-xs font-semibold tracking-widest uppercase text-white/20">
                    Completadas
                  </p>
                  <ul className="flex flex-col gap-1.5 px-3 pb-3">
                    {tasks
                      .filter((t) => t.completed)
                      .map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                      ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer progress bar */}
        {!loading && tasks.length > 0 && (
          <div className="px-1">
            <div className="flex justify-between text-xs text-white/25 mb-1.5">
              <span>Progreso</span>
              <span>{tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${tasks.length > 0 ? (done / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
