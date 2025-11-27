# FingerFury Backend

Minimal Express + Mongoose backend for the Type Sprint (FingerFury) demo.

API endpoints (demo mode without MongoDB):

- GET /api/health — returns { ok: true, mode: 'no-db' }
- GET /api/words?count=3 — returns an array of words for the game (fallback list)
- GET /api/scores/top — returns top scores (if DB connected)
- POST /api/scores — submit a new score (if DB connected)

Run (development):

```powershell
cd backend
npm install
$env:SKIP_DB='1'
npm run dev
```
