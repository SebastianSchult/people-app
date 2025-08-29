# People App (React + Node + MariaDB)

A simple CRUD application to manage users, built with **React** (frontend), **Node.js + Express** (backend), and **MariaDB** as the database.  
This project was created as a learning and showcase project.

---

## Features
- Create, read, update and delete users (CRUD)
- Frontend built with React
- Backend built with Node.js + Express
- Persistent storage with MariaDB
- Server-side search, sorting and pagination support
- API returns `X-Total-Count` header for pagination
- Basic form validation and user feedback (Snackbar)

---

## Tech Stack
**Frontend**
- React
- Fetch API
- CSS for styling

**Backend**
- Node.js + Express
- MySQL2 (MariaDB client)
- CORS, dotenv

**Database**
- MariaDB 11 (via Homebrew or Docker)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended, tested with v22)
- MariaDB running locally  
  (via Homebrew `brew services start mariadb` or Docker)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/SebastianSchult/people-app.git
   cd people-app

CREATE DATABASE IF NOT EXISTS people;
CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'app';
GRANT ALL PRIVILEGES ON people.* TO 'app'@'localhost';
FLUSH PRIVILEGES;

DB_SOCKET=/tmp/mysql.sock
DB_USER=app
DB_PASSWORD=app
DB_NAME=people

cd backend
npm install
npm run dev
→ API at http://localhost:4000

cd ../frontend
npm install
npm start

API Endpoints
	•	GET    /users – list users (?q=search&sort=first_name&order=asc&skip=0&take=10)
	•	POST   /users – create user { first_name, last_name, email }
	•	PUT    /users/:id – update user
	•	DELETE /users/:id – delete user

Roadmap
	•	Add pagination in frontend (using skip & take)
	•	Add authentication
	•	Deploy on Docker

  License

MIT License – free to use and adapt.

👤 Author: Sebastian Schult

---

👉 Das kannst du direkt als `README.md` ins Projekt legen, committen und pushen:  

```bash
echo "<hier den markdown text einfügen>" > README.md
git add README.md
git commit -m "Add project README"
git push

# 📋 People App (React + Node + MariaDB)

A simple CRUD application to manage users, built with **React** (frontend), **Node.js + Express** (backend), and **MariaDB** as the database.  
This project was created as a learning and showcase project.

---

## ✨ Features
- ➕ Create, 📖 Read, ✏️ Update and ❌ Delete users (CRUD)
- ⚛️ Frontend built with **React**
- 🖥️ Backend built with **Node.js + Express**
- 🗄️ Persistent storage with **MariaDB**
- 🔍 Server-side search, sorting and pagination support
- 📊 API returns `X-Total-Count` header for pagination
- ✅ Basic form validation and user feedback (Snackbar)

---

## 🛠 Tech Stack
**Frontend**
- React
- Fetch API
- CSS for styling

**Backend**
- Node.js + Express
- MySQL2 (MariaDB client)
- CORS, dotenv

**Database**
- MariaDB 11 (via Homebrew or Docker)

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18+ recommended, tested with v22)
- MariaDB running locally  
  (via Homebrew `brew services start mariadb` or Docker)

### ⚙️ Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SebastianSchult/people-app.git
   cd people-app
   ```

2. **Configure the database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS people;
   CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'app';
   GRANT ALL PRIVILEGES ON people.* TO 'app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Create a `.env` file** in `backend/`:
   ```dotenv
   DB_SOCKET=/tmp/mysql.sock
   DB_USER=app
   DB_PASSWORD=app
   DB_NAME=people
   ```

4. **Start backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   👉 API available at: [http://localhost:4000](http://localhost:4000)

5. **Start frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
   👉 Frontend available at: [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Endpoints

- `GET    /users` – list users (`?q=search&sort=first_name&order=asc&skip=0&take=10`)
- `POST   /users` – create user `{ first_name, last_name, email }`
- `PUT    /users/:id` – update user
- `DELETE /users/:id` – delete user

---

## 🗺 Roadmap
- [ ] Add pagination in frontend (using `skip` & `take`)
- [ ] Add authentication
- [ ] Deploy on Docker

---

## 📄 License
MIT License – free to use and adapt.

---

👤 **Author**: [Sebastian Schult](https://github.com/SebastianSchult)