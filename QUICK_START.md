# 🚀 Quick Start Guide

## Backend Commands

### 1. Navigate to backend directory
```bash
cd app/backend
```

### 2. Activate virtual environment
```bash
# On macOS/Linux:
source env/bin/activate

# On Windows:
env\Scripts\activate
```

### 3. Install dependencies (if not already installed)
```bash
pip install -r requirements.txt
```

### 4. Run the backend server
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run at:** `http://localhost:8000`
**API docs at:** `http://localhost:8000/docs`

---

## Frontend Commands

### 1. Navigate to frontend directory
```bash
cd app/frontend
```

### 2. Install dependencies (first time only)
```bash
npm install
# or
yarn install
```

### 3. Run the frontend development server
```bash
npm run dev
# or
yarn dev
```

**Frontend will run at:** `http://localhost:3000` (or the port shown in terminal)

---

## All-in-One Commands (Terminal 1: Backend)

```bash
cd app/backend && source env/bin/activate && uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## All-in-One Commands (Terminal 2: Frontend)

```bash
cd app/frontend && npm install && npm run dev
```

---

## Prerequisites Checklist

- ✅ MongoDB running (local or remote)
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ `.env` files configured (already created)
- ✅ Virtual environment activated (backend)
- ✅ Dependencies installed (both backend and frontend)

---

## Troubleshooting

### Backend won't start?
1. Make sure virtual environment is activated
2. Check if MongoDB is running: `mongosh` or check your MongoDB connection
3. Verify `.env` file exists in `app/backend/`
4. Check if port 8000 is available: `lsof -i :8000`

### Frontend won't start?
1. Make sure you've run `npm install` first
2. Check if port 3000 is available
3. Verify `.env` file exists in `app/frontend/`
4. Clear cache: `rm -rf node_modules package-lock.json && npm install`

### MongoDB connection error?
1. Make sure MongoDB is running: `mongod` (for local)
2. Or update `MONGO_URL` in `.env` to your remote MongoDB connection string

---

## Next Steps

1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Start exploring the platform!

