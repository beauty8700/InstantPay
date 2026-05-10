# InstaPay — Full Stack Setup Guide

## Project Structure

```
instapay/
├── backend/              ← Express + MongoDB API
│   ├── index.js          ← Entry point
│   ├── db.js             ← MongoDB connection
│   ├── .env.example      ← Copy to .env and fill in
│   ├── middleware/
│   │   └── auth.js       ← JWT middleware
│   ├── models/
│   │   └── user.js       ← User, Account, Transaction schemas
│   └── routes/
│       ├── user.js       ← Auth + profile routes
│       └── account.js    ← Balance, deposit, transfer, history
└── src/                  ← Vite + React frontend
    ├── api.js            ← All API calls (use this, not raw fetch)
    └── ...pages/components
```

---

## Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/instapay
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
CLIENT_URL=http://localhost:5173
PORT=3000
```

### 3. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

> **Note:** MongoDB transactions (used by the transfer route) require a **replica set**.  
> For local dev, run MongoDB with: `mongod --replSet rs0`  
> Then in mongo shell once: `rs.initiate()`  
> Or use **MongoDB Atlas** (free tier) which runs replica sets automatically.

---

## Frontend Setup

### 1. Install dependencies
```bash
cd ..   # back to project root
npm install
```

### 2. Configure environment
```bash
cp frontend.env.example .env
```
Content:
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start the dev server
```bash
npm run dev
```

---

## API Reference

### Auth (no token required)
| Method | Route | Body |
|--------|-------|------|
| POST | `/api/user/signup` | `{ firstName, lastName, username (email), password }` |
| POST | `/api/user/login`  | `{ username, password }` |
| GET  | `/api/user/bulk?filter=` | — |

### Protected (Bearer token required)
| Method | Route | Body |
|--------|-------|------|
| GET  | `/api/user/me` | — |
| PUT  | `/api/user/update` | `{ firstName?, lastName?, password? }` |
| GET  | `/api/account/balance` | — |
| GET  | `/api/account/stats` | — |
| POST | `/api/account/deposit` | `{ amount }` |
| POST | `/api/account/transfer` | `{ toUserId, amount, note? }` |
| GET  | `/api/account/transactions?page=1&limit=20` | — |

---

## Using the API in Frontend

```js
import { login, saveSession, transfer } from "./api";

// Login
const { token, user } = await login({ username: "arjun@gmail.com", password: "secret123" });
saveSession(token, user);

// Transfer money
await transfer({ toUserId: "64abc...", amount: 500, note: "Dinner split" });
```
