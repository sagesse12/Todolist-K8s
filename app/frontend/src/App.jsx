import { useState, useEffect, useCallback } from 'react';
 
const API = '';
 
/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmtDate = d => d ? new Date(d).toISOString().split('T')[0] : null;
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
 
function getStatus(todo) {
  if (todo.done) return 'done';
  if (!todo.due_date) return 'none';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(todo.due_date); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return 'late';
  if (diff <= 2) return 'soon';
  return 'future';
}
 
function fmtDue(dateStr) {
  if (!dateStr) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff === 0)  return "Aujourd'hui";
  if (diff === 1)  return 'Demain';
  if (diff === -1) return 'Hier';
  if (diff < 0)    return `Il y a ${-diff}j`;
  return due.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
 
/* ─── Styles ───────────────────────────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0d14; color: #e2e8f0; min-height: 100vh; }
 
  :root {
    --bg:#0a0d14; --bg2:#111520; --bg3:#161c2d; --bg4:#1c2438;
    --border:#1e2a42; --border2:#283550;
    --blue:#4f8eff; --purple:#8b5cf6; --green:#10d98a;
    --amber:#f59e0b; --red:#f87171; --cyan:#22d3ee;
    --text:#e2e8f0; --muted:#4a5578; --muted2:#8892b0;
  }
 
  .shell { display:flex; height:100vh; overflow:hidden; }
 
  /* ── Sidebar ── */
  .sidebar { width:220px; min-width:220px; background:var(--bg2); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:20px 0; }
  .brand { padding:0 16px 20px; border-bottom:1px solid var(--border); margin-bottom:16px; }
  .brand-icon { width:36px; height:36px; background:linear-gradient(135deg,var(--blue),var(--purple)); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:10px; }
  .brand-name { font-size:15px; font-weight:700; color:#fff; }
  .brand-sub  { font-size:10px; color:var(--muted); margin-top:1px; font-family:monospace; }
 
  .nav-section { padding:4px 16px 6px; font-size:9px; font-weight:700; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:8px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:8px 16px; font-size:13px; color:var(--muted2); cursor:pointer; border-left:2px solid transparent; transition:all .15s; border-radius:0 6px 6px 0; margin-right:8px; }
  .nav-item:hover { color:var(--text); background:var(--bg3); }
  .nav-item.active { color:var(--blue); border-left-color:var(--blue); background:rgba(79,142,255,.08); }
  .nav-icon { font-size:14px; width:18px; text-align:center; }
 
  .sidebar-stats { margin:auto 0 0; padding:16px; }
  .stat-mini { background:var(--bg3); border:1px solid var(--border); border-radius:10px; padding:10px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; }
  .stat-mini-lbl { font-size:11px; color:var(--muted); }
  .stat-mini-val { font-size:16px; font-weight:700; color:#fff; }
  .green { color:var(--green) !important; }
  .amber { color:var(--amber) !important; }
  .red   { color:var(--red)   !important; }
 
  .pbar-wrap { margin-top:8px; }
  .pbar-lbl  { display:flex; justify-content:space-between; font-size:10px; color:var(--muted); margin-bottom:5px; }
  .pbar      { height:4px; background:var(--border2); border-radius:2px; overflow:hidden; }
  .pbar-fill { height:100%; background:linear-gradient(90deg,var(--blue),var(--purple)); border-radius:2px; transition:width .4s; }
 
  /* ── Main ── */
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .topbar { background:var(--bg2); border-bottom:1px solid var(--border); padding:14px 24px; display:flex; align-items:center; gap:12px; }
  .topbar h1 { font-size:18px; font-weight:700; letter-spacing:-.03em; color:#fff; margin-right:auto; }
  .search-wrap { position:relative; flex:1; max-width:320px; }
  .search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:13px; pointer-events:none; }
  .search-input { width:100%; background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:8px 12px 8px 32px; font-size:13px; color:var(--text); outline:none; font-family:inherit; transition:border-color .2s; }
  .search-input:focus { border-color:var(--blue); }
  .search-input::placeholder { color:var(--muted); }
 
  .content { flex:1; overflow-y:auto; padding:20px 24px; }
 
  /* ── Add form ── */
  .add-form { background:var(--bg3); border:1px solid var(--border); border-radius:12px; padding:14px 16px; margin-bottom:16px; }
  .form-row { display:flex; gap:8px; margin-bottom:8px; }
  .form-row2 { display:flex; gap:8px; }
  .form-input { flex:1; background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:9px 12px; font-size:13px; color:var(--text); outline:none; font-family:inherit; transition:border-color .2s; }
  .form-input:focus { border-color:var(--blue); }
  .form-input::placeholder { color:var(--muted); }
  .form-date { background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:8px 10px; font-size:12px; color:var(--muted2); outline:none; font-family:inherit; transition:border-color .2s; color-scheme:dark; }
  .form-date:focus { border-color:var(--blue); color:var(--text); }
  .form-label-input { flex:1; background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:8px 10px; font-size:12px; color:var(--muted2); outline:none; font-family:inherit; transition:border-color .2s; }
  .form-label-input:focus { border-color:var(--blue); color:var(--text); }
  .form-label-input::placeholder { color:var(--muted); }
  .add-btn { padding:9px 18px; background:var(--blue); border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; white-space:nowrap; transition:background .15s; }
  .add-btn:hover { background:#3a7ae8; }
  .add-btn:disabled { opacity:.5; cursor:not-allowed; }
 
  /* ── Filters ── */
  .filters { display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
  .fbtn { padding:6px 14px; border-radius:20px; border:1px solid var(--border); background:none; font-size:11px; font-weight:600; color:var(--muted2); cursor:pointer; font-family:inherit; transition:all .15s; }
  .fbtn:hover { border-color:var(--border2); color:var(--text); }
  .fbtn.active       { background:var(--blue);  border-color:var(--blue);  color:#fff; }
  .fbtn.active.f-done { background:var(--green); border-color:var(--green); color:#000; }
  .fbtn.active.f-soon { background:var(--amber); border-color:var(--amber); color:#000; }
  .fbtn.active.f-late { background:var(--red);   border-color:var(--red);   color:#fff; }
 
  /* ── Task list ── */
  .task-list { display:flex; flex-direction:column; gap:7px; }
  .task-card { background:var(--bg3); border:1px solid var(--border); border-radius:12px; padding:13px 15px; display:flex; align-items:flex-start; gap:11px; transition:all .2s; animation:fadeIn .2s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
  .task-card:hover { border-color:var(--border2); background:var(--bg4); }
  .task-card.is-done { opacity:.45; }
 
  .task-check { width:20px; height:20px; border-radius:50%; border:2px solid var(--border2); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all .2s; margin-top:1px; font-size:10px; color:transparent; background:transparent; }
  .task-card.is-done .task-check { background:var(--green); border-color:var(--green); color:#000; }
 
  .task-body { flex:1; min-width:0; }
  .task-title-row { display:flex; align-items:center; gap:8px; margin-bottom:3px; flex-wrap:wrap; }
  .task-title { font-size:13px; color:var(--text); font-weight:500; line-height:1.3; }
  .task-card.is-done .task-title { text-decoration:line-through; color:var(--muted); }
 
  .badge { font-size:10px; padding:1px 7px; border-radius:10px; font-weight:600; white-space:nowrap; }
  .badge-late   { background:rgba(248,113,113,.12); color:var(--red);   border:1px solid rgba(248,113,113,.3); }
  .badge-soon   { background:rgba(245,158,11,.15);  color:var(--amber); border:1px solid rgba(245,158,11,.3); }
  .badge-done   { background:rgba(16,217,138,.1);   color:var(--green); border:1px solid rgba(16,217,138,.25); }
  .badge-future { background:rgba(79,142,255,.1);   color:var(--blue);  border:1px solid rgba(79,142,255,.25); }
 
  .task-meta { font-size:11px; color:var(--muted); display:flex; align-items:center; gap:10px; margin-top:3px; flex-wrap:wrap; }
 
  .task-actions { display:flex; gap:4px; flex-shrink:0; opacity:0; transition:opacity .15s; }
  .task-card:hover .task-actions { opacity:1; }
  .act-btn { background:none; border:none; color:var(--muted); font-size:14px; cursor:pointer; padding:3px 7px; border-radius:6px; transition:all .15s; }
  .act-btn.edit:hover { color:var(--blue); background:rgba(79,142,255,.1); }
  .act-btn.del:hover  { color:var(--red);  background:rgba(248,113,113,.08); }
 
  /* ── Modal ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
  .modal { background:var(--bg3); border:1px solid var(--border2); border-radius:14px; padding:20px; width:100%; max-width:400px; }
  .modal h3 { font-size:15px; font-weight:700; color:#fff; margin-bottom:16px; }
  .modal-input { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; font-size:13px; color:var(--text); outline:none; font-family:inherit; margin-bottom:8px; transition:border-color .2s; }
  .modal-input:focus { border-color:var(--blue); }
  .modal-row { display:flex; gap:8px; margin-bottom:16px; }
  .modal-actions { display:flex; gap:8px; justify-content:flex-end; }
  .btn-cancel { padding:8px 16px; background:none; border:1px solid var(--border2); border-radius:8px; color:var(--muted2); font-size:13px; cursor:pointer; font-family:inherit; }
  .btn-save   { padding:8px 16px; background:var(--blue); border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
 
  /* ── Calendar ── */
  .cal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .cal-header h2 { font-size:16px; font-weight:700; color:#fff; }
  .cal-nav { background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:5px 14px; color:var(--muted2); font-size:13px; cursor:pointer; font-family:inherit; transition:all .15s; }
  .cal-nav:hover { border-color:var(--border2); color:var(--text); }
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:10px; }
  .cal-day-name { text-align:center; font-size:10px; font-weight:700; color:var(--muted); padding:4px 0; text-transform:uppercase; }
  .cal-cell { background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:6px; min-height:72px; cursor:pointer; transition:border-color .15s; }
  .cal-cell:hover { border-color:var(--border2); }
  .cal-cell.today { border-color:var(--blue) !important; background:rgba(79,142,255,.05); }
  .cal-cell.other-month { opacity:.25; }
  .cal-cell.has-tasks { border-color:var(--border2); }
  .cal-num { font-size:11px; font-weight:600; color:var(--muted2); margin-bottom:3px; }
  .cal-cell.today .cal-num { color:var(--blue); font-weight:700; }
  .cal-task-pill { font-size:9px; padding:2px 5px; border-radius:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; margin-top:2px; }
  .pill-done   { background:rgba(16,217,138,.12); color:var(--green); }
  .pill-late   { background:rgba(248,113,113,.12); color:var(--red); }
  .pill-soon   { background:rgba(245,158,11,.12);  color:var(--amber); }
  .pill-normal { background:rgba(79,142,255,.1);   color:var(--blue); }
  .cal-legend  { display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--muted); margin-top:8px; }
  .legend-dot  { width:8px; height:8px; border-radius:2px; display:inline-block; margin-right:4px; }
 
  /* ── Empty / Loader ── */
  .empty-state { text-align:center; padding:48px 0; color:var(--muted); }
  .empty-icon  { font-size:38px; margin-bottom:10px; }
  .empty-text  { font-size:13px; }
  .loader { display:flex; align-items:center; justify-content:center; gap:8px; padding:40px; color:var(--muted); font-size:13px; }
  .spinner { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--blue); border-radius:50%; animation:spin .8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
 
  /* ── Error banner ── */
  .error-banner { background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.2); border-radius:10px; padding:10px 14px; font-size:12px; color:var(--red); margin-bottom:14px; }
 
  /* ── Toast ── */
  .toast { position:fixed; bottom:20px; right:20px; padding:10px 18px; border-radius:10px; font-size:12px; font-weight:600; opacity:0; transform:translateY(10px); transition:all .3s; pointer-events:none; z-index:100; }
  .toast.show { opacity:1; transform:translateY(0); }
  .toast.success { background:#1a3a2a; border:1px solid var(--green); color:var(--green); }
  .toast.error   { background:#3a1a1a; border:1px solid var(--red);   color:var(--red); }
 
  @media (max-width:768px) {
    .sidebar { display:none; }
    .content { padding:16px; }
  }
`;
 
/* ─── Composant principal ──────────────────────────────────────────────────── */
export default function App() {
  const [todos,    setTodos]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [view,     setView]     = useState('list');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [adding,   setAdding]   = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate,  setNewDate]  = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editTodo, setEditTodo] = useState(null);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [toast, setToast] = useState({ msg: '', type: 'success', show: false });
 
  /* ── Toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2300);
  };
 
  /* ── Load ── */
  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API}/todos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTodos(await res.json());
    } catch {
      setError('Impossible de joindre le backend. Vérifie que les Pods sont Running.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  /* ── Add ── */
  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, due_date: newDate || null, label: newLabel || null }),
      });
      if (!res.ok) throw new Error();
      setNewTitle(''); setNewDate(''); setNewLabel('');
      showToast('Tâche ajoutée !');
      load();
    } catch {
      showToast("Erreur lors de l'ajout", 'error');
    } finally {
      setAdding(false);
    }
  };
 
  /* ── Toggle ── */
  const toggleTodo = async (id, done) => {
    try {
      await fetch(`${API}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });
      showToast(done ? 'Tâche terminée !' : 'Tâche réactivée');
      load();
    } catch { showToast('Erreur', 'error'); }
  };
 
  /* ── Delete ── */
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
      showToast('Tâche supprimée');
      load();
    } catch { showToast('Erreur', 'error'); }
  };
 
  /* ── Save edit ── */
  const saveEdit = async () => {
    if (!editTodo) return;
    try {
      await fetch(`${API}/todos/${editTodo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTodo.title,
          due_date: editTodo.due_date || null,
          label: editTodo.label || null,
        }),
      });
      setEditTodo(null);
      showToast('Tâche modifiée !');
      load();
    } catch { showToast('Erreur', 'error'); }
  };
 
  /* ── Stats ── */
  const doneCount = todos.filter(t => t.done).length;
  const lateCount = todos.filter(t => getStatus(t) === 'late').length;
  const soonCount = todos.filter(t => getStatus(t) === 'soon').length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
 
  /* ── Filtered list ── */
  const q = search.toLowerCase().trim();
  const visible = todos
    .filter(t => !q || t.title.toLowerCase().includes(q) || (t.label || '').toLowerCase().includes(q))
    .filter(t => {
      if (filter === 'done') return t.done;
      if (filter === 'todo') return !t.done;
      if (filter === 'soon') return getStatus(t) === 'soon';
      if (filter === 'late') return getStatus(t) === 'late';
      return true;
    });
 
  /* ── Calendar data ── */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const year = calMonth.getFullYear(), month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const calCells = [];
  for (let i = 0; i < startDow; i++) { const d = new Date(firstDay); d.setDate(d.getDate() - (startDow - i)); calCells.push({ date: d, other: true }); }
  for (let d = 1; d <= lastDay.getDate(); d++) calCells.push({ date: new Date(year, month, d), other: false });
  while (calCells.length < 42) { const last = calCells[calCells.length - 1].date; const d = new Date(last); d.setDate(d.getDate() + 1); calCells.push({ date: d, other: true }); }
 
  const tasksByDay = {};
  todos.forEach(t => {
    if (t.due_date) {
      const key = fmtDate(new Date(t.due_date));
      tasksByDay[key] = tasksByDay[key] || [];
      tasksByDay[key].push(t);
    }
  });
 
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
 
  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
 
      <div className="shell">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">✓</div>
            <div className="brand-name">TodoList</div>
            <div className="brand-sub">NodeJS · PostgreSQL</div>
          </div>
 
          <div className="nav-section">Navigation</div>
          <div className={`nav-item${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
            <span className="nav-icon">📋</span> Mes tâches
          </div>
          <div className={`nav-item${view === 'cal' ? ' active' : ''}`} onClick={() => setView('cal')}>
            <span className="nav-icon">📅</span> Calendrier
          </div>
 
          <div className="sidebar-stats">
            <div className="stat-mini"><span className="stat-mini-lbl">Total</span><span className="stat-mini-val">{todos.length}</span></div>
            <div className="stat-mini"><span className="stat-mini-lbl">Terminées</span><span className="stat-mini-val green">{doneCount}</span></div>
            <div className="stat-mini"><span className="stat-mini-lbl">Proches</span><span className="stat-mini-val amber">{soonCount}</span></div>
            <div className="stat-mini"><span className="stat-mini-lbl">En retard</span><span className="stat-mini-val red">{lateCount}</span></div>
            <div className="pbar-wrap">
              <div className="pbar-lbl"><span>Progression</span><span>{pct}%</span></div>
              <div className="pbar"><div className="pbar-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          </div>
        </aside>
 
        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            <h1>{view === 'list' ? 'Mes tâches' : 'Calendrier'}</h1>
            {view === 'list' && (
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Rechercher une tâche..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
 
          <div className="content">
 
            {/* ── VUE LISTE ── */}
            {view === 'list' && (
              <>
                {/* Formulaire d'ajout */}
                <div className="add-form">
                  <div className="form-row">
                    <input
                      className="form-input"
                      placeholder="Ajouter une nouvelle tâche..."
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTodo()}
                      maxLength={200}
                    />
                    <button className="add-btn" onClick={addTodo} disabled={adding || !newTitle.trim()}>
                      {adding ? '...' : '+ Ajouter'}
                    </button>
                  </div>
                  <div className="form-row2">
                    <input
                      className="form-date"
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      title="Date d'échéance"
                    />
                    <input
                      className="form-label-input"
                      placeholder="Label du jour (ex: Lundi matin, Sprint 3...)"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                    />
                  </div>
                </div>
 
                {/* Erreur */}
                {error && <div className="error-banner">⚠ {error}</div>}
 
                {/* Filtres */}
                <div className="filters">
                  {[
                    { key: 'all',  label: `Toutes (${todos.length})`,                       cls: '' },
                    { key: 'todo', label: `À faire (${todos.length - doneCount})`,          cls: '' },
                    { key: 'done', label: `✓ Faites (${doneCount})`,                        cls: 'f-done' },
                    { key: 'soon', label: `⏰ Proches (${soonCount})`,                      cls: 'f-soon' },
                    { key: 'late', label: `⚠ En retard (${lateCount})`,                    cls: 'f-late' },
                  ].map(f => (
                    <button
                      key={f.key}
                      className={`fbtn ${f.cls}${filter === f.key ? ' active' : ''}`}
                      onClick={() => setFilter(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
 
                {/* Liste */}
                {loading ? (
                  <div className="loader"><div className="spinner" /><span>Chargement...</span></div>
                ) : visible.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">{filter === 'done' ? '🏆' : filter === 'late' ? '🎉' : '📋'}</div>
                    <div className="empty-text">
                      {filter === 'done' ? 'Aucune tâche terminée'
                        : filter === 'late' ? 'Aucune tâche en retard !'
                        : q ? `Aucun résultat pour "${q}"`
                        : 'Aucune tâche — commence par en ajouter une !'}
                    </div>
                  </div>
                ) : (
                  <div className="task-list">
                    {visible.map(todo => {
                      const st = getStatus(todo);
                      const badgeMap = {
                        late:   <span className="badge badge-late">⚠ En retard</span>,
                        soon:   <span className="badge badge-soon">⏰ Bientôt</span>,
                        done:   <span className="badge badge-done">✓ Fait</span>,
                        future: <span className="badge badge-future">📅 Planifié</span>,
                        none:   null,
                      };
                      return (
                        <div key={todo.id} className={`task-card${todo.done ? ' is-done' : ''}`}>
                          <div className="task-check" onClick={() => toggleTodo(todo.id, !todo.done)}>
                            {todo.done && '✓'}
                          </div>
                          <div className="task-body">
                            <div className="task-title-row">
                              <span className="task-title">{todo.title}</span>
                              {badgeMap[st]}
                            </div>
                            <div className="task-meta">
                              {todo.due_date && <span>📅 {fmtDue(todo.due_date)}</span>}
                              {todo.label    && <span>🏷 {todo.label}</span>}
                            </div>
                          </div>
                          <div className="task-actions">
                            <button className="act-btn edit" onClick={() => setEditTodo({ ...todo })} title="Modifier">✏️</button>
                            <button className="act-btn del"  onClick={() => deleteTodo(todo.id)}      title="Supprimer">×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
 
            {/* ── VUE CALENDRIER ── */}
            {view === 'cal' && (
              <>
                <div className="cal-header">
                  <button className="cal-nav" onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹ Préc.</button>
                  <h2>{calMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                  <button className="cal-nav" onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Suiv. ›</button>
                </div>
 
                <div className="cal-grid">
                  {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
                  {calCells.map((cell, i) => {
                    const key = fmtDate(cell.date);
                    const tasks = tasksByDay[key] || [];
                    const isToday = key === fmtDate(today);
                    return (
                      <div key={i} className={`cal-cell${isToday ? ' today' : ''}${cell.other ? ' other-month' : ''}${tasks.length ? ' has-tasks' : ''}`}>
                        <div className="cal-num">{cell.date.getDate()}</div>
                        {tasks.slice(0, 2).map(t => {
                          const st = getStatus(t);
                          const cls = t.done ? 'pill-done' : st === 'late' ? 'pill-late' : st === 'soon' ? 'pill-soon' : 'pill-normal';
                          return <div key={t.id} className={`cal-task-pill ${cls}`} title={t.title}>{t.title}</div>;
                        })}
                        {tasks.length > 2 && <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>+{tasks.length - 2} autres</div>}
                      </div>
                    );
                  })}
                </div>
 
                <div className="cal-legend">
                  {[
                    { cls: 'rgba(16,217,138,.3)',  label: 'Terminée' },
                    { cls: 'rgba(248,113,113,.3)', label: 'En retard' },
                    { cls: 'rgba(245,158,11,.3)',  label: 'Bientôt' },
                    { cls: 'rgba(79,142,255,.3)',  label: 'Planifiée' },
                  ].map(l => (
                    <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="legend-dot" style={{ background: l.cls }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </>
            )}
 
          </div>
        </div>
      </div>
 
      {/* ── MODAL EDIT ── */}
      {editTodo && (
        <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) setEditTodo(null); }}>
          <div className="modal">
            <h3>Modifier la tâche</h3>
            <input
              className="modal-input"
              placeholder="Titre"
              value={editTodo.title}
              onChange={e => setEditTodo(t => ({ ...t, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
            />
            <div className="modal-row">
              <input
                className="modal-input form-date"
                type="date"
                style={{ flex: 1, margin: 0 }}
                value={editTodo.due_date ? fmtDate(new Date(editTodo.due_date)) : ''}
                onChange={e => setEditTodo(t => ({ ...t, due_date: e.target.value || null }))}
              />
              <input
                className="modal-input form-label-input"
                placeholder="Label (ex: Lundi matin)"
                style={{ flex: 1, margin: 0 }}
                value={editTodo.label || ''}
                onChange={e => setEditTodo(t => ({ ...t, label: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditTodo(null)}>Annuler</button>
              <button className="btn-save"   onClick={saveEdit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
 
      {/* ── TOAST ── */}
      <div className={`toast ${toast.type}${toast.show ? ' show' : ''}`}>{toast.msg}</div>
    </>
  );
}