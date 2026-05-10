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

## 🚀 Deployment to Render

### Backend Deployment

1. **Create a Render Account**: Go to [render.com](https://render.com) and sign up

2. **Connect Your Repository**: Link your GitHub repository to Render

3. **Create a Web Service**:
   - Choose "Web Service" from the dashboard
   - Connect your repository
   - Set the following configuration:
     - **Name**: `instapay-backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Root Directory**: `Backend` (if your backend is in a subfolder)

4. **Environment Variables**: Add these in Render dashboard:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://sana0956y52a_db_user:sana256Beauty@cluster0.ugqct7t.mongodb.net/?appName=Cluster0
   JWT_SECRET=your_secure_jwt_secret_here
   CLIENT_URL=https://your-frontend-url.onrender.com
   PORT=10000
   ```

5. **MongoDB Atlas Configuration**:
   - Go to your MongoDB Atlas dashboard
   - Navigate to "Network Access"
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Or add Render's IP ranges if you want to be more secure

6. **Deploy**: Click "Create Web Service" and wait for deployment

### Frontend Deployment

1. **Create Another Web Service** for the frontend:
   - **Name**: `instapay-frontend`
   - **Runtime**: `Static Site`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `Frontend` (if your frontend is in a subfolder)

2. **Environment Variables** for frontend:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com
   ```

3. **Update Backend CLIENT_URL**: After frontend deployment, update the `CLIENT_URL` in backend environment variables

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env  # Fill in your values
npm run dev           # Development with nodemon
npm start             # Production
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev           # Development server
npm run build         # Production build
```

## 📡 API Endpoints

### Authentication
- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/profile` - Update user profile

### Account Management
- `GET /api/account/balance` - Get account balance
- `POST /api/account/deposit` - Add money to account
- `POST /api/account/transfer` - Transfer money to another user
- `GET /api/account/transactions` - Get transaction history
- `GET /api/account/stats` - Get account statistics

## 🔒 Security Features
- JWT authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- MongoDB connection with proper error handling

## 🐛 Troubleshooting

### MongoDB Connection Issues
- **Local**: Make sure MongoDB is running: `mongod`
- **Atlas**: Check IP whitelist and connection string
- **Render**: Ensure environment variables are set correctly

### Port Issues
- Backend runs on port 3000 locally, 10000 on Render
- Frontend runs on port 5173 locally

### CORS Issues
- Update `CLIENT_URL` in backend .env for production

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
