import { pool } from "../src/db.js";

async function main() {
  const [res] = await pool.query("DELETE FROM users");
  console.log(`🧹 deleted rows: ${res.affectedRows}`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});