# GitHub Actions Workflows

## deploy.yml

This workflow automatically deploys the frontend to GitHub Pages when you push to the `main` or `master` branch.

### What it does:
1. Checks out the code
2. Sets up Node.js 18
3. Installs frontend dependencies
4. Builds the React app
5. Deploys to GitHub Pages

### Requirements:
- GitHub Pages must be enabled in repository settings
- Source should be set to "GitHub Actions"
- Optional: Set `VITE_BACKEND_URL` and `VITE_GOOGLE_MAPS_API_KEY` in GitHub Secrets

### Usage:
Just push to main branch and the workflow will automatically deploy!

## backend-deploy.yml

This is a reminder workflow that doesn't actually deploy. It serves as documentation that the backend needs separate hosting.
