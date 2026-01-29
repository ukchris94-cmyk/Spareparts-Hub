# Deployment Guide

This guide explains how to deploy the SpareParts Hub application.

## Architecture

- **Frontend**: React app deployed to GitHub Pages
- **Backend**: FastAPI app needs separate hosting (Railway, Render, etc.)

## Frontend Deployment (GitHub Pages)

### Prerequisites

1. GitHub repository set up
2. GitHub Pages enabled in repository settings
3. Backend API URL (for production)

### Setup Steps

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Source: Select "GitHub Actions"
   - Save

2. **Set GitHub Secrets** (Optional but recommended):
   - Go to Settings → Secrets and variables → Actions
   - Add secrets:
     - `VITE_BACKEND_URL`: Your production backend URL (e.g., `https://your-backend.railway.app`)
     - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key (optional)

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

4. **Monitor deployment**:
   - Go to Actions tab in GitHub
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete, your site will be available at:
     - `https://yourusername.github.io/Sparepart-Hub/`

### Custom Domain (Optional)

1. Add `CNAME` file in `app/frontend/public/` with your domain
2. Configure DNS settings in your domain provider
3. Update GitHub Pages settings with your custom domain

## Backend Deployment

GitHub Pages only hosts static files, so the backend must be deployed separately.

### Option 1: Railway (Recommended)

1. **Sign up**: https://railway.app
2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Configure**:
   - Root Directory: `app/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables**:
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: `spareparts_hub`
   - `SECRET_KEY`: Generate a strong secret key
   - `CORS_ORIGINS`: Your GitHub Pages URL
5. **Get your backend URL** and update `VITE_BACKEND_URL` in GitHub Secrets

### Option 2: Render

1. **Sign up**: https://render.com
2. **Create Web Service**:
   - Connect your GitHub repository
   - Root Directory: `app/backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. **Set Environment Variables** (same as Railway)
4. **Deploy**

### Option 3: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Login**: `fly auth login`
3. **Create app**: `fly launch` in `app/backend` directory
4. **Set secrets**: `fly secrets set MONGO_URL=... SECRET_KEY=...`
5. **Deploy**: `fly deploy`

### MongoDB Setup

For production, use MongoDB Atlas (free tier available):

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create cluster** (free M0 tier)
3. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
4. **Add IP whitelist**: Add `0.0.0.0/0` for Railway/Render
5. **Use connection string** in backend environment variables

## Environment Variables

### Frontend (GitHub Secrets)

```env
VITE_BACKEND_URL=https://your-backend.railway.app
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Backend (Hosting Platform)

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=spareparts_hub
SECRET_KEY=your-strong-secret-key-here
CORS_ORIGINS=https://yourusername.github.io
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public
```

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed to GitHub Pages
- [ ] `VITE_BACKEND_URL` updated in GitHub Secrets
- [ ] CORS configured on backend
- [ ] MongoDB connection working
- [ ] Test registration/login
- [ ] Test API endpoints
- [ ] SSL/HTTPS working (automatic on GitHub Pages)

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_BACKEND_URL` is set correctly
- Check if backend CORS allows GitHub Pages domain

### Backend not connecting
- Verify MongoDB connection string
- Check environment variables are set
- Review backend logs for errors

### CORS errors
- Update `CORS_ORIGINS` in backend to include GitHub Pages URL
- Format: `https://yourusername.github.io`

## Workflow Files

- `.github/workflows/deploy.yml` - Frontend deployment to GitHub Pages
- `.github/workflows/backend-deploy.yml` - Reminder workflow (doesn't deploy)

## Notes

- GitHub Pages is free for public repositories
- Backend hosting costs vary by platform (free tiers available)
- MongoDB Atlas has a free tier (512MB storage)
- Consider using environment-specific configurations

---

**Happy Deploying! 🚀**
