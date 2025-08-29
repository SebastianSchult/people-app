# People App (React + Node + MariaDB)

This backend provides a small CRUD API for `users` (first name, last name, email) and is connected to a React frontend.

---
## Requirements
- Node.js 18+ (tested with v22)
- MariaDB (Homebrew) running as a service
- Optional: `jq` for prettier `curl` outputs

---
## Setup (Database)
1. Start MariaDB (Homebrew):
   ```bash
   brew services start mariadb
   ```
2. Create database + user (once, as `root`):
   ```sql
   CREATE DATABASE IF NOT EXISTS people;
   CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'app';
   GRANT ALL PRIVILEGES ON people.* TO 'app'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Create `.env` file in `backend/` (choose Socket **or** TCP – one variant):
   ```dotenv
   # Variant A: Unix socket (recommended locally)
   DB_SOCKET=/tmp/mysql.sock

   # Variant B: TCP
   # DB_HOST=127.0.0.1
   # DB_PORT=3306

   DB_USER=app
   DB_PASSWORD=app
   DB_NAME=people
   ```

---
## Start
**Backend**
```bash
cd backend
npm i
npm run dev   # http://localhost:4000
```
**Frontend**
```bash
cd ../frontend
npm i
npm start     # http://localhost:3000
```

---
## Health Checks
- `GET http://localhost:4000/health` → `{ ok: true }`
- `GET http://localhost:4000/db-health` → `{ ok: true }`

---
## Seed / Reset
Insert sample data and clear the table (if scripts are set up):
```bash
cd backend
npm run db:seed   # insert sample data
npm run db:reset  # clear table
```
Alternatively (directly via CLI, same connection as the backend):
```bash
mysql -u app -p -S /tmp/mysql.sock -D people \
  -e "INSERT INTO users (first_name,last_name,email) VALUES ('Max','Mustermann','max@example.com');"
```

---
## API
- `GET    /users`
- `POST   /users`           Body: `{ first_name, last_name, email }`
- `PUT    /users/:id`
- `DELETE /users/:id`
- Error codes: `409` (email duplicate), `400` (validation), `404` (not found)

---
## Troubleshooting
- **`ECONNREFUSED 127.0.0.1:3306`** → TCP not reachable → use socket (`DB_SOCKET=/tmp/mysql.sock`).
- **`Access denied`** → Check user/password/grants (as `root`: set password, execute GRANT).
- **Frontend does not show insert** → Click “Reload” in the UI; clear search field; check `GET /users` in browser DevTools.
- **Check service status**:
  ```bash
  brew services list
  mysql -u app -p -S /tmp/mysql.sock -D people -e "SELECT 1"
  ```

---
## Notes
- Locally, the **Unix socket** is often more stable/faster than TCP. The backend will also automatically detect `/tmp/mysql.sock` if `DB_SOCKET` is not loaded.
- CORS is enabled for `http://localhost:3000`.