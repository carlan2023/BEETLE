# Deployment Guide - Beetle

## Critical Production Configuration

### 1. CORS Configuration (Most Important!)

**Problem**: Registration fails after deployment because the backend blocks requests from the frontend.

**Solution**: Set the `CLIENT_URL` environment variable to your actual frontend URL.

#### For Railway Backend:

1. Go to your Railway project dashboard
2. Select the backend service
3. Go to **Variables** tab
4. Add/Update the following:

```
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

**Example**:

```
CLIENT_URL=https://beetle-frontend.vercel.app
NODE_ENV=production
```

---

### 2. Environment Variables Checklist

#### Backend (Railway)

| Variable                | Example Value                        | Purpose                    |
| ----------------------- | ------------------------------------ | -------------------------- |
| `NODE_ENV`              | `production`                         | Enable production mode     |
| `PORT`                  | `5000`                               | (Usually set by Railway)   |
| `MONGODB_URI`           | `mongodb+srv://...`                  | Database connection        |
| `JWT_SECRET`            | `long-random-string`                 | Token signing secret       |
| `CLIENT_URL`            | `https://beetle-frontend.vercel.app` | **CRITICAL: Frontend URL** |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name                      | Image uploads              |
| `CLOUDINARY_API_KEY`    | Your API key                         | Image uploads              |
| `CLOUDINARY_API_SECRET` | Your API secret                      | Image uploads              |

#### Frontend (Vercel)

No `VITE_API_URL` needed if using Vercel rewrites (already configured in `vercel.json`).

The `vercel.json` file rewrites all `/api/*` requests to your Railway backend:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://beetle-production-f62a.up.railway.app"
    }
  ]
}
```

---

### 3. Testing Registration After Deployment

1. **Test Vendor Registration**:
   - Go to your deployed frontend
   - Click "Register as Vendor"
   - Fill in and submit the form
   - Check the browser console (F12) for network errors
   - Check the backend logs for CORS errors

2. **Test Rider Registration**:
   - Go to "Become a Rider" page
   - Submit the form
   - Check for success message

3. **Backend Health Check**:
   ```
   curl https://your-backend-url.up.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "Beetle API is running 🪲",
     "env": "production",
     "mongodb": "✅ Connected"
   }
   ```

---

### 4. Common Issues & Solutions

#### Issue: "Registration failed" after deployment

**Cause**: `CLIENT_URL` not set on backend  
**Fix**: Set `CLIENT_URL` environment variable to your frontend URL

#### Issue: CORS error in browser console

**Cause**: Frontend URL doesn't match `CLIENT_URL` on backend  
**Fix**: Verify the exact frontend URL and update `CLIENT_URL`

#### Issue: 401/403 after registration

**Cause**: Database connection or JWT secret mismatch  
**Fix**: Verify `MONGODB_URI` and `JWT_SECRET` are correct in Railway

#### Issue: "Too many requests" error

**Cause**: Rate limiting triggered  
**Fix**: Wait 15 minutes or contact support if legitimate use

---

### 5. Production Deployment Steps

#### Step 1: Deploy Backend First

```bash
# Push to Railway (if using Git integration)
git push origin main

# Or use Railway CLI:
railway up
```

#### Step 2: Update Backend Environment Variables

- Go to Railway dashboard
- Add `CLIENT_URL=https://your-frontend-url.vercel.app`
- Add `NODE_ENV=production`
- Redeploy or restart the service

#### Step 3: Deploy Frontend

```bash
# Push to Vercel (if using Git integration)
git push origin main
```

#### Step 4: Verify Deployment

- Test the health endpoint
- Test vendor registration
- Test rider signup
- Check logs for errors

---

### 6. Getting URLs for Configuration

#### Your Backend URL

```bash
# From Railway CLI:
railway link  # shows your project
railway open  # shows the dashboard
```

Your backend URL will be in the format:

```
https://beetle-production-xxxx.up.railway.app
```

#### Your Frontend URL

```bash
# From Vercel:
# Go to project settings → Domains
# Your URL is shown (default: project-name.vercel.app)
```

Your frontend URL will be in the format:

```
https://beetle-frontend.vercel.app
```

---

## Quick Reference: What to Update in Production

1. **Railway Backend Environment Variables**:

   ```
   CLIENT_URL = https://beetle-frontend.vercel.app
   NODE_ENV = production
   MONGODB_URI = your-atlas-uri
   JWT_SECRET = your-jwt-secret
   [Other API keys...]
   ```

2. **Frontend vercel.json** (already configured):
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://beetle-production-xxxx.up.railway.app"
       }
     ]
   }
   ```

That's it! Registration should work after setting `CLIENT_URL` correctly.
