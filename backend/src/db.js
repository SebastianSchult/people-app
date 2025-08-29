import 'dotenv/config';
import fs from 'fs';
import mysql from 'mysql2/promise';

// Gemeinsame Optionen
const base = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
};

// Kandidaten für den Unix-Socket (reihenfolge: ENV, /tmp, homebrew)
const candidates = [
  process.env.DB_SOCKET,
  '/tmp/mysql.sock',
  '/opt/homebrew/var/mysql/mysql.sock',
].filter(Boolean);

let socketPath = null;
for (const p of candidates) {
  try {
    if (p && fs.existsSync(p)) { socketPath = p; break; }
  } catch {}
}

export const pool = socketPath
  ? mysql.createPool({
      ...base,
      socketPath,
    })
  : mysql.createPool({
      ...base,
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
    });