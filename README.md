# FingerFury / Type Sprint

This repository contains a demo typing game (frontend + backend). The project includes a React + Vite frontend and an Express backend with optional MongoDB persistence.

Quick start (development):

- Backend

```powershell
cd backend
npm install
$env:SKIP_DB='1'    # run without MongoDB for a local demo
npm run dev
```

- Frontend

```powershell
cd frontend
npm install
npm run dev -- --port 5173 --host
```

Open http://localhost:5173 in your browser.

If you want persistence, set `MONGODB_URI` in `backend/.env` (or provide an Atlas URI) and restart the backend without SKIP_DB.
