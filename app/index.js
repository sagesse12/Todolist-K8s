const path = require('path'); 
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));


// ─── Connexion PostgreSQL via variables d'environnement ───
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ─── Initialisation de la table ───────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id    SERIAL PRIMARY KEY,
      title TEXT    NOT NULL,
      done  BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('✓ Table todos prête');
}

// ─── Routes ───────────────────────────────────────────────

// GET /todos – liste toutes les tâches
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /todos – créer une tâche
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });
  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /todos/:id – marquer comme fait
app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET done = $1 WHERE id = $2 RETURNING *',
      [done, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /todos/:id – supprimer
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /health – healthcheck pour Kubernetes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ... Tes imports et routes ...

// 1. Déplace la route health AVANT l'init de la BDD pour qu'elle soit prioritaire
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(PORT, async () => {
  console.log(`✓ Serveur démarré sur le port ${PORT}`);
  try {
    await initDB();
  } catch (err) {
    console.error('✗ Erreur connexion BDD au démarrage:', err.message);
  }
});
