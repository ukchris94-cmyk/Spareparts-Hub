# Quick Setup Guide for GitHub Pages

## Step-by-Step Instructions

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**
4. Click **Save**

### 2. Set Up GitHub Secrets (Optional but Recommended)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

   **VITE_BACKEND_URL** (Required after backend deployment)
   - Value: Your backend URL (e.g., `https://your-app.railway.app`)
   - This will be set after you deploy the backend

   **VITE_GOOGLE_MAPS_API_KEY** (Optional)
   - Value: Your Google Maps API key
   - Only needed if you want map features

### 3. Update Repository Name in Workflow

If your repository name is NOT `Sparepart-Hub`, update the base path:

1. Open `.github/workflows/deploy.yml`
2. Find this line:
   ```yaml
   VITE_BASE_PATH: '/Sparepart-Hub/'
   ```
3. Change `/Sparepart-Hub/` to `/[YOUR-REPO-NAME]/`
4. Also update `app/frontend/vite.config.js` if needed

### 4. Push to Main Branch

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 5. Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You should see "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (green checkmark)
4. Your site will be available at:
   - `https://[your-username].github.io/Sparepart-Hub/`

### 6. Deploy Backend (Required)

The frontend needs a backend to work. Deploy the backend first:

**Option A: Railway (Easiest)**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set Root Directory: `app/backend`
6. Add environment variables (see DEPLOYMENT.md)
7. Copy the generated URL
8. Update `VITE_BACKEND_URL` in GitHub Secrets

**Option B: Render**
1. Go to https://render.com
2. Sign up with GitHub
3. Create "New Web Service"
4. Connect your repository
5. Set Root Directory: `app/backend`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
8. Add environment variables
9. Deploy and update `VITE_BACKEND_URL`

## Troubleshooting

### Workflow fails
- Check Actions tab for error messages
- Ensure Node.js version is compatible
- Verify all dependencies are in package.json

### Site shows 404
- Check if base path matches repository name
- Verify GitHub Pages is enabled
- Check Actions tab for deployment status

### API calls fail
- Verify `VITE_BACKEND_URL` is set correctly
- Check backend CORS settings
- Ensure backend is deployed and running

### Blank page
- Open browser console (F12) for errors
- Check if assets are loading
- Verify base path configuration

## Custom Domain (Optional)

1. Create `app/frontend/public/CNAME` file:
   ```
   yourdomain.com
   ```
2. Configure DNS:
   - Add CNAME record: `yourdomain.com` → `[username].github.io`
3. Update GitHub Pages settings with your domain

---

**That's it! Your app will auto-deploy on every push to main! 🚀**
