# Leaderboard Empty - Troubleshooting Guide

## Problem
Leaderboard shows "No scores yet" even though database has scores.

## Root Cause
The leaderboard now queries the `UserProfile` collection (not `Score` collection). When we made this change, existing scores need to be synced to UserProfile.

## Solution Steps

### Step 1: Check Backend Service Status
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find service: `typesprint-backend`
3. Check status:
   - ✅ **Live** (green) = Good, go to Step 2
   - ❌ **Build Failed** / **Deploy Failed** = Check logs and redeploy
   - 🟡 **Building** = Wait for it to finish

### Step 2: Verify Backend URL
Test if backend is responding:
```bash
# PowerShell
Invoke-WebRequest -Uri "https://typesprint-backend.onrender.com/api/health" -Method GET

# Should return: {"status":"OK"}
```

If you get 404 "Not Found", the backend didn't deploy correctly.

### Step 3: Check Frontend Environment Variable
1. Go to Render Dashboard → `typesprint-frontend` service
2. Click "Environment" tab
3. Verify `VITE_API_BASE_URL` is set to:
   ```
   https://typesprint-backend.onrender.com
   ```
4. If it's missing or wrong, add/fix it and redeploy frontend

### Step 4: Sync Scores to UserProfile Collection
Once backend is running, sync existing scores:

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://typesprint-backend.onrender.com/api/admin/sync-profiles" -Method POST
```

**Or in browser:**
Just visit: `https://typesprint-backend.onrender.com/api/admin/sync-profiles`

This will:
- Read all scores from Score collection
- Create UserProfile records for each user
- Copy highest scores to UserProfile
- Leaderboard will now show data

### Step 5: Refresh Leaderboard
After sync completes:
1. Go to your game: `https://typesprint134.onrender.com/#/leaderboard`
2. Click "Refresh" button
3. Should now show all players and scores

## Quick Check Commands

```powershell
# Test backend health
Invoke-WebRequest -Uri "https://typesprint-backend.onrender.com/api/health"

# Test leaderboard endpoint
Invoke-WebRequest -Uri "https://typesprint-backend.onrender.com/api/scores/top?limit=10"

# Sync profiles
Invoke-WebRequest -Uri "https://typesprint-backend.onrender.com/api/admin/sync-profiles" -Method POST
```

## Common Issues

### Backend shows "Not Found" for all endpoints
- **Cause**: Backend service failed to deploy
- **Fix**: Check Render logs, redeploy backend service

### Leaderboard still empty after sync
- **Cause**: Frontend using wrong API URL
- **Fix**: Check `VITE_API_BASE_URL` in frontend environment variables

### Some players missing from leaderboard
- **Cause**: Their scores have `userId` missing or null
- **Fix**: Scores must have valid `userId` field to sync

## MongoDB Direct Check

If you want to verify database directly:

```javascript
// In MongoDB Atlas → Collections
// Check UserProfile collection:
db.userprofiles.find({}).sort({highestScore: -1})

// Should show users with their highest scores
```

## Code References

- Backend leaderboard endpoint: `backend/src/server.js` line 293
- Sync profiles endpoint: `backend/src/server.js` line 232
- Frontend API calls: `frontend/src/services/api.js`
- Leaderboard page: `frontend/src/pages/LeaderboardPage.jsx`
