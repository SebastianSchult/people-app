import { pool } from "../src/db.js";

async function main() {
  const users = [
    ["Max", "Mustermann", "max@example.com"],
    ["Erika", "Musterfrau", "erika@example.com"],
    ["Ada", "Lovelace", "ada@example.com"],
  ];
  for (const [first, last, email] of users) {
    try {
      await pool.query(
        "INSERT INTO users (first_name,last_name,email) VALUES (?,?,?)",
        [first, last, email]
      );
      console.log("✅ inserted:", email);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        console.log("⚠️ already exists:", email);
      } else {
        console.error("❌ error for", email, e.message);
      }
    }
  }
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});