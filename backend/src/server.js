import 'dotenv/config';
// backend/src/server.js
import express from "express";
import cors from "cors";
import { listUsers, createUser, updateUser, deleteUser } from "./store.js";
import { pool } from "./db.js";

const app = express();

// CORS für dein React-Frontend (http://localhost:3000)
app.use(cors({ origin: "http://localhost:3000" }));
// JSON-Body parser
app.use(express.json());
// Expose custom headers to the browser (for pagination/metadata)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
  next();
});

// Health-Check
app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/db-health", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows[0]?.ok === 1 });
  } catch (e) {
    next(e);
  }
});

// --- Users CRUD (persistiert via MariaDB über store.js) ---

// Liste (serverseitige Suche/Sortierung/Pagination)
app.get("/users", async (req, res, next) => {
  try {
    const {
      q = "",
      sort = "id",
      order = "desc",
      skip = "0",
      take = "50",
    } = req.query;

    // Whitelist für sichere Sortierung
    const allowedSort = new Set(["id", "first_name", "last_name", "email", "created_at", "updated_at"]);
    const sortCol = allowedSort.has(String(sort)) ? String(sort) : "id";
    const sortDir = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

    // Pagination begrenzen
    let offset = Number.parseInt(skip, 10);
    let limit = Number.parseInt(take, 10);
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    // Suche (case-insensitive)
    const like = `%${String(q).trim().toLowerCase()}%`;
    const where = String(q).trim()
      ? "WHERE LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ?"
      : "";
    const params = String(q).trim() ? [like, like, like] : [];

    // Gesamtanzahl für Pagination-UI
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    // Daten holen
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, created_at, updated_at
       FROM users
       ${where}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.setHeader("X-Total-Count", String(total));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Anlegen
app.post("/users", async (req, res, next) => {
  try {
    const created = await createUser(req.body); // { first_name, last_name, email }
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Aktualisieren
app.put("/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateUser(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Löschen
app.delete("/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deleteUser(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Zentraler Fehler-Handler (nutzt err.status, falls gesetzt)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// Serverstart
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API läuft auf http://localhost:${PORT}`));