# Render Deployment Guide - Type Sprint

There are two ways to deploy. **Option A** is the fastest as it sets up both the backend and frontend at once.

## Option A: One-Click Deployment (Recommended)

Render will use the `render.yaml` file I added to your repository to set up everything automatically.

1.  Log in to [Render](https://dashboard.render.com).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will show both `typesprint-backend` and `typesprint-frontend`.
5.  Click **Apply**.
6.  **Important**: Go to the `typesprint-backend` service settings and add your `MONGO_URI` environment variable.

---

## Option B: Manual Deployment (Step-by-Step)

Create a new **Web Service** on Render and connect your GitHub repository.

- **Name**: `typesprint-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables
Go to the **Env Vars** tab and add:
| Key | Value |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB connection string |
| `NODE_ENV` | `production` |

> [!IMPORTANT]
> Once deployed, copy the **Backend URL** (e.g., `https://typesprint-backend.onrender.com`). You will need this for the frontend.

---

## 2. Deploy the Frontend (Static Site)

Create a new **Static Site** on Render and connect the same GitHub repository.

- **Name**: `typesprint`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Environment Variables
Go to the **Env Vars** tab and add:
| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | Your Backend URL from Step 1 |

---

## 3. Post-Deployment Check
- Visit your frontend URL.
- Try logging in or playing a game.
- If the leaderboard is empty, remember to run the seed command locally or via Render's "Shell" if enabled: `npm run seed:words` (in the backend directory).

> [!TIP]
> Ensure your MongoDB Atlas IP Whitelist allows access from Render (use `0.0.0.0/0` for testing, or find Render's outgoing IP addresses).
