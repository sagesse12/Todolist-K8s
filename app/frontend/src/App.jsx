import { useState, useEffect, useCallback } from 'react';

/* ─── L'API est sur le même domaine (Express sert le frontend) ─── */
const API = '';

/* ─── Styles inline complets ─────────────────────────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0f1117;
    color: #e8eaf0;
    min-height: 100vh;
  }

  /* ── Layout ── */
  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px;
    min-width: 260px;
    background: #161b27;
    border-right: 1px solid #1e2740;
    padding: 28px 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .sidebar-brand {
    padding: 0 20px 24px;
    border-bottom: 1px solid #1e2740;
    margin-bottom: 20px;
  }

  .brand-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #4f8eff, #a855f7);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 12px;
  }

  .brand-name {
    font-size: 16px; font-weight: 700;
    color: #fff; letter-spacing: -0.03em;
  }

  .brand-sub {
    font-size: 11px; color: #4a5578;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
  }

  /* ── Sidebar stats ── */
  .sidebar-stats {
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat-card {
    background: #1c2235;
    border: 1px solid #1e2740;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-label { font-size: 12px; color: #4a5578; font-weight: 500; }
  .stat-value { font-size: 20px; font-weight: 700; color: #fff; }

  .stat-card.done-card .stat-value { color: #22d98a; }
  .stat-card.todo-card .stat-value { color: #4f8eff; }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 16px 0;
  }

  .k8s-badge {
    display: flex; align-items: center; gap: 8px;
    background: #1c2235;
    border: 1px solid #1e2740;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px; color: #4a5578;
  }

  .k8s-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22d98a;
    box-shadow: 0 0 6px #22d98a;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ── Main ── */
  .main {
    flex: 1;
    padding: 40px 48px;
    max-width: 720px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 28px; font-weight: 700;
    letter-spacing: -0.04em; color: #fff;
    margin-bottom: 4px;
  }

  .page-sub { font-size: 13px; color: #4a5578; }

  /* ── Input zone ── */
  .input-zone {
    display: flex; gap: 10px;
    margin-bottom: 20px;
  }

  .task-input {
    flex: 1;
    background: #161b27;
    border: 1px solid #1e2740;
    border-radius: 10px;
    padding: 13px 16px;
    font-size: 14px; color: #e8eaf0;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color .2s;
  }

  .task-input:focus { border-color: #4f8eff; }
  .task-input::placeholder { color: #2d3655; }

  .add-btn {
    padding: 13px 22px;
    background: #4f8eff;
    border: none; border-radius: 10px;
    color: #fff; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    transition: background .15s, transform .1s;
  }

  .add-btn:hover { background: #3a7ae8; }
  .add-btn:active { transform: scale(0.97); }
  .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Filters ── */
  .filters {
    display: flex; gap: 6px;
    margin-bottom: 20px;
  }

  .filter-btn {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid #1e2740;
    background: none;
    font-size: 12px; font-weight: 600;
    color: #4a5578;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all .15s;
  }

  .filter-btn:hover { border-color: #2d3655; color: #8892b0; }

  .filter-btn.active {
    background: #4f8eff;
    border-color: #4f8eff;
    color: #fff;
  }

  .filter-btn.active.f-done {
    background: #22d98a;
    border-color: #22d98a;
    color: #000;
  }

  /* ── Task list ── */
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .task-item {
    display: flex; align-items: center; gap: 12px;
    background: #161b27;
    border: 1px solid #1e2740;
    border-radius: 12px;
    padding: 14px 16px;
    transition: border-color .2s, background .2s;
    animation: slideIn .2s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .task-item:hover { border-color: #2d3655; background: #1a2035; }
  .task-item.is-done { opacity: 0.5; }

  .task-check {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 2px solid #2d3655;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
    transition: all .2s; font-size: 11px; color: transparent;
  }

  .task-item.is-done .task-check {
    background: #22d98a;
    border-color: #22d98a;
    color: #000;
  }

  .task-title {
    flex: 1; font-size: 14px; color: #c8cfe0; line-height: 1.4;
  }

  .task-item.is-done .task-title {
    text-decoration: line-through; color: #2d3655;
  }

  .task-meta {
    font-size: 11px; color: #2d3655;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
  }

  .task-del {
    background: none; border: none;
    color: #2d3655; font-size: 18px;
    cursor: pointer; padding: 2px 6px;
    border-radius: 6px; line-height: 1;
    transition: all .15s;
  }

  .task-del:hover { color: #f87171; background: rgba(248,113,113,0.08); }

  /* ── Empty / Error ── */
  .empty-state {
    text-align: center;
    padding: 48px 0;
    color: #2d3655;
    font-size: 14px;
  }

  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  /* ── Loading ── */
  .loader {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 40px;
    color: #4a5578; font-size: 13px;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid #1e2740;
    border-top-color: #4f8eff;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px; font-weight: 500;
    opacity: 0; transform: translateY(12px);
    transition: all .3s; pointer-events: none;
    z-index: 99;
  }

  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.success { background: #1a3a2a; border: 1px solid #22d98a; color: #22d98a; }
  .toast.error   { background: #3a1a1a; border: 1px solid #f87171; color: #f87171; }

  /* ── Error banner ── */
  .error-banner {
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px; color: #f87171;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Progress bar in sidebar ── */
  .progress-wrap {
    padding: 0 16px;
    margin-bottom: 16px;
  }

  .progress-lbl {
    display: flex; justify-content: space-between;
    font-size: 11px; color: #4a5578;
    margin-bottom: 6px;
  }

  .progress-bar {
    height: 4px; background: #1e2740;
    border-radius: 2px; overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f8eff, #a855f7);
    border-radius: 2px;
    transition: width .4s ease;
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { padding: 24px 16px; }
  }
`;

/* ─── Helpers ──────────────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

/* ─── App principal ────────────────────────────────────────────────── */
export default function App() {
  const [todos, setTodos]         = useState([]);
  const [input, setInput]         = useState('');
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [error, setError]         = useState(null);
  const [toast, setToast]         = useState({ msg: '', type: 'success', show: false });

  /* ── Toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  };

  /* ── Charger les todos ── */
  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API}/todos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTodos(await res.json());
    } catch (e) {
      setError('Impossible de joindre le serveur. Vérifie que le backend tourne.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  /* ── Ajouter ── */
  const addTodo = async () => {
    const title = input.trim();
    if (!title) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      setInput('');
      showToast('Tâche ajoutée !');
      loadTodos();
    } catch {
      showToast('Erreur lors de l\'ajout', 'error');
    } finally {
      setAdding(false);
    }
  };

  /* ── Cocher/décocher ── */
  const toggleTodo = async (id, done) => {
    try {
      await fetch(`${API}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });
      showToast(done ? 'Tâche terminée !' : 'Tâche réactivée');
      loadTodos();
    } catch {
      showToast('Erreur', 'error');
    }
  };

  /* ── Supprimer ── */
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
      showToast('Tâche supprimée');
      loadTodos();
    } catch {
      showToast('Erreur', 'error');
    }
  };

  /* ── Filtres ── */
  const visible = todos.filter(t => {
    if (filter === 'done') return t.done;
    if (filter === 'todo') return !t.done;
    return true;
  });

  const doneCount = todos.filter(t => t.done).length;
  const todoCount = todos.filter(t => !t.done).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <>
      <style>{css}</style>

      <div className="app-shell">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">✓</div>
            <div className="brand-name">TodoList</div>
            <div className="brand-sub">NodeJS + PostgreSQL</div>
          </div>

          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-lbl">
              <span>Progression</span>
              <span>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <span className="stat-value">{todos.length}</span>
            </div>
            <div className="stat-card done-card">
              <span className="stat-label">Terminées</span>
              <span className="stat-value">{doneCount}</span>
            </div>
            <div className="stat-card todo-card">
              <span className="stat-label">Restantes</span>
              <span className="stat-value">{todoCount}</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="k8s-badge">
              <span className="k8s-dot" />
              <span>Déployé sur Kubernetes</span>
            </div>
          </div>
        </aside>

        {/* ── Contenu principal ── */}
        <main className="main">
          <div className="page-header">
            <h1 className="page-title">Mes tâches</h1>
            <p className="page-sub">{todos.length} tâche{todos.length !== 1 ? 's' : ''} au total</p>
          </div>

          {/* Input */}
          <div className="input-zone">
            <input
              className="task-input"
              type="text"
              placeholder="Ajouter une nouvelle tâche..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              maxLength={200}
            />
            <button className="add-btn" onClick={addTodo} disabled={adding || !input.trim()}>
              {adding ? '...' : '+ Ajouter'}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Filters */}
          <div className="filters">
            <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
              Toutes ({todos.length})
            </button>
            <button className={`filter-btn${filter === 'todo' ? ' active' : ''}`} onClick={() => setFilter('todo')}>
              À faire ({todoCount})
            </button>
            <button className={`filter-btn f-done${filter === 'done' ? ' active' : ''}`} onClick={() => setFilter('done')}>
              Terminées ({doneCount})
            </button>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="loader">
              <div className="spinner" />
              <span>Chargement...</span>
            </div>
          ) : (
            <div className="task-list">
              {visible.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{filter === 'done' ? '🏆' : '📋'}</div>
                  {filter === 'done' ? 'Aucune tâche terminée' : filter === 'todo' ? 'Tout est fait !' : 'Aucune tâche — commence par en ajouter une !'}
                </div>
              ) : (
                visible.map(todo => (
                  <div key={todo.id} className={`task-item${todo.done ? ' is-done' : ''}`}>
                    <div
                      className="task-check"
                      onClick={() => toggleTodo(todo.id, !todo.done)}
                      title={todo.done ? 'Marquer non fait' : 'Marquer fait'}
                    >
                      {todo.done && '✓'}
                    </div>
                    <span className="task-title">{todo.title}</span>
                    <span className="task-meta">{formatDate(todo.created_at)}</span>
                    <button className="task-del" onClick={() => deleteTodo(todo.id)} title="Supprimer">×</button>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.type}${toast.show ? ' show' : ''}`}>
        {toast.msg}
      </div>
    </>
  );
}
