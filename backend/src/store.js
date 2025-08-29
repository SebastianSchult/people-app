// backend/src/store.js
import { pool } from "./db.js";

// --- Utils ---
function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}
function toUser(row) {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// --- API ---
export async function listUsers() {
  const [rows] = await pool.query(
    "SELECT id, first_name, last_name, email, created_at, updated_at FROM users ORDER BY id DESC"
  );
  return rows.map(toUser);
}

export async function getUser(id) {
  const [rows] = await pool.query(
    "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  if (rows.length === 0) {
    const e = new Error("User not found");
    e.status = 404; throw e;
  }
  return toUser(rows[0]);
}

export async function createUser({ first_name, last_name, email }) {
  first_name = (first_name ?? "").trim();
  last_name  = (last_name  ?? "").trim();
  email      = (email      ?? "").trim();

  if (!first_name || !last_name || !email) {
    const e = new Error("first_name, last_name and email are required");
    e.status = 400; throw e;
  }
  if (!validateEmail(email)) {
    const e = new Error("Invalid email");
    e.status = 400; throw e;
  }

  try {
    const [res] = await pool.query(
      "INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)",
      [first_name, last_name, email]
    );
    return await getUser(res.insertId);
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      const e = new Error("Email already exists");
      e.status = 409; throw e;
    }
    throw err;
  }
}

export async function updateUser(id, patch = {}) {
  const current = await getUser(id);

  let first_name = (patch.first_name ?? current.first_name).trim();
  let last_name  = (patch.last_name  ?? current.last_name).trim();
  let email      = (patch.email      ?? current.email).trim();

  if (!first_name || !last_name || !email) {
    const e = new Error("first_name, last_name and email are required");
    e.status = 400; throw e;
  }
  if (!validateEmail(email)) {
    const e = new Error("Invalid email");
    e.status = 400; throw e;
  }

  try {
    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?",
      [first_name, last_name, email, id]
    );
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      const e = new Error("Email already exists");
      e.status = 409; throw e;
    }
    throw err;
  }

  return await getUser(id);
}

export async function deleteUser(id) {
  const [res] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  if (res.affectedRows === 0) {
    const e = new Error("User not found");
    e.status = 404; throw e;
  }
}