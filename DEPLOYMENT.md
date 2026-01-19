# Deployment Guide for Speakers App

This application consists of two parts:
1.  **Backend:** Node.js + Express + Socket.io
2.  **Frontend:** React (Vite)

You will need to deploy them separately.

## 1. Deploy the Backend (Render.com Recommended)
Render is free and easy to use for Node.js apps.

1.  Push your code to a **GitHub repository**.
2.  Sign up/Login to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings:**
    *   **Name:** `speakers-backend` (or similar)
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
6.  Click **Create Web Service**.
7.  **IMPORTANT:** Once deployed, Render will give you a URL (e.g., `https://speakers-backend.onrender.com`). **Copy this URL.**

## 2. Deploy the Frontend (Vercel Recommended)
Vercel is excellent for Vite/React apps.

1.  Sign up/Login to [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    *   **Framework Preset:** Vite (should be auto-detected)
    *   **Environment Variables:**
        *   Key: `VITE_BACKEND_URL`
        *   Value: `https://speakers-backend.onrender.com` (The URL you copied from Render)
5.  Click **Deploy**.

## 3. Post-Deployment
The frontend will now be live on a Vercel URL (e.g., `https://speakers-app.vercel.app`).
- Open the Vercel URL in your browser.
- It should connect to your Render backend automatically.

### Troubleshooting
- **Frontend can't connect:** Check the browser console (F12). If you see connection errors, verify the `VITE_BACKEND_URL` in Vercel settings matches your Render backend URL exactly (no trailing slashes is usually safer, though Socket.io handles it).
- **CORS Errors:** If you see CORS errors in the backend logs or browser, you might need to update `server.js` to allow the specific frontend domain in the `cors` origin array, instead of just localhost.
    *   In `server.js`, update the `cors` options:
        ```javascript
        const io = socketIo(server, {
          cors: {
            // Add your Vercel URL here
            origin: ["http://localhost:5000", "https://your-app-name.vercel.app"], 
            methods: ["GET", "POST"]
          }
        });
        ```
