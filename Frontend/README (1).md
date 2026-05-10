# InstaPay — Frontend

React + Vite + Tailwind CSS payment app UI.

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- The backend server running (see `/backend/README.md`)

---

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and set the backend URL:

```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start the dev server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## Project Structure

```
src/
├── main.jsx              # Vite entry point
├── App.jsx               # Router setup, all route definitions
├── index.css             # Global styles + Tailwind directives
├── api.js                # All API calls — import from here, never raw fetch()
│
├── components/
│   └── AppLayout.jsx     # Sidebar + mobile drawer shell for authenticated pages
│
└── pages/
    ├── SignIn.jsx         # Login screen (public)
    ├── SignUp.jsx         # 2-step registration (public)
    ├── Home.jsx           # Dashboard — balance, quick actions, recent activity
    ├── Send.jsx           # Contact search + UPI ID input
    ├── SendMoney.jsx      # 3-step payment flow (amount → PIN → success)
    ├── AddMoney.jsx       # Add funds via UPI / Net Banking / Debit Card
    ├── Transactions.jsx   # Full transaction history with filters
    └── Profile.jsx        # Edit profile, settings, logout
```

---

## Available Routes

| Path | Page | Auth required |
|------|------|---------------|
| `/signin` | Sign In | No |
| `/signup` | Sign Up | No |
| `/home` | Dashboard | Yes |
| `/send` | Pay & Transfer | Yes |
| `/sendmoney` | Send Money | Yes |
| `/addmoney` | Add Money | Yes |
| `/transactions` | Transaction History | Yes |
| `/profile` | Profile | Yes |

---

## Using the API Layer

All backend calls go through `src/api.js`. Import the function you need:

```js
import { login, saveSession, getBalance, transfer } from "./api";

// Login and save session
const { token, user } = await login({ username: "arjun@gmail.com", password: "mypassword" });
saveSession(token, user);

// Fetch balance
const { balance } = await getBalance();

// Send money
await transfer({ toUserId: "64abc...", amount: 500, note: "Dinner" });
```

Never write `fetch()` directly in a component — if the API URL or headers change, `api.js` is the only file you need to update.

### Session helpers

| Function | What it does |
|----------|-------------|
| `saveSession(token, user)` | Saves token + user to localStorage |
| `clearSession()` | Removes token + user (call on logout) |
| `getUser()` | Returns the stored user object |
| `isLoggedIn()` | Returns `true` if a token exists |

---

## Environment Variables

All frontend env variables must start with `VITE_` or Vite will not expose them to the app.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the backend API |

Access in code via `import.meta.env.VITE_API_URL`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production (output in `/dist`) |
| `npm run preview` | Preview the production build locally |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `vite` | Build tool and dev server |
| `tailwindcss` | Utility CSS (used alongside custom CSS) |

---

## Connecting to Production Backend

When deploying, update `.env` to point to your live API:

```
VITE_API_URL=https://your-api-domain.com/api
```

Then build:

```bash
npm run build
```

Deploy the `/dist` folder to Vercel, Netlify, or any static host.

---

## Notes

- The app uses `localStorage` to store the JWT token and user object. Clearing browser storage logs the user out.
- MongoDB transactions (used by the transfer feature) require a replica set on the backend. See the backend README for setup details.
- All amounts are in Indian Rupees (₹).
