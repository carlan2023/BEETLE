# Troubleshooting Registration Failures

## Symptom

- ✅ Registration works on `localhost`
- ❌ Registration fails after deployment to production
- Vendor and Rider signups both fail

## Root Cause

The backend's CORS (Cross-Origin Resource Sharing) configuration is blocking requests from your deployed frontend because the `CLIENT_URL` environment variable is not set to your actual frontend URL.

### How It Works

1. Frontend (Vercel) makes a request to Backend (Railway)
2. Browser checks CORS policy
3. Backend's CORS middleware checks if the request origin is allowed
4. **If `CLIENT_URL` is not set correctly, the request is blocked**

```
Frontend URL: https://beetle-frontend.vercel.app
↓
Makes registration request to backend
↓
Backend checks: Is https://beetle-frontend.vercel.app in allowed origins?
↓
❌ NO → Request blocked by CORS
✅ YES → Request proceeds
```

## Step-by-Step Fix

### Step 1: Identify Your URLs

**Frontend URL** (Vercel):

- Go to https://vercel.com → your Beetle project
- Copy the domain (e.g., `beetle-frontend.vercel.app`)
- Full URL: `https://beetle-frontend.vercel.app`

**Backend URL** (Railway):

- Go to https://railway.app → your Beetle Backend project
- Note the service URL (e.g., `beetle-production-xxxx.up.railway.app`)
- Full URL: `https://beetle-production-xxxx.up.railway.app`

### Step 2: Update Backend Environment Variables

**Using Railway Dashboard**:

1. Go to https://railway.app
2. Select your Beetle Backend project
3. Click on the backend service
4. Go to **Variables** tab
5. Add or update:
   ```
   CLIENT_URL=https://beetle-frontend.vercel.app
   NODE_ENV=production
   ```
6. Redeploy (Railway should auto-deploy on variable change)

**Alternative (Using Railway CLI)**:

```bash
railway link  # Select your project
railway variables set CLIENT_URL=https://beetle-frontend.vercel.app
railway variables set NODE_ENV=production
railway up    # Deploy changes
```

### Step 3: Verify CORS Configuration

Open your browser's developer console (F12) and test:

```javascript
// Test CORS by checking the health endpoint
fetch("https://beetle-production-xxxx.up.railway.app/api/health")
  .then((r) => r.json())
  .then((d) => console.log(d))
  .catch((e) => console.error("CORS Error:", e));
```

Expected response:

```json
{
  "success": true,
  "message": "Beetle API is running 🪲",
  "env": "production",
  "mongodb": "✅ Connected",
  "corsOrigin": "https://beetle-frontend.vercel.app",
  "allowedOrigins": ["https://beetle-frontend.vercel.app", "/\\.vercel\\.app$/"]
}
```

## Diagnostic Checklist

### 1. Check Frontend Console (Browser F12)

Look for CORS errors like:

```
Access to XMLHttpRequest at 'https://backend-url/api/auth/register'
from origin 'https://frontend-url.vercel.app'
has been blocked by CORS policy
```

**Action**: Update `CLIENT_URL` on backend

### 2. Check Backend Logs

Look for origin errors:

```
❌ CORS blocked origin: https://beetle-frontend.vercel.app
```

**Action**: Verify `CLIENT_URL` matches exactly

### 3. Test the Health Endpoint

```bash
curl https://your-backend-url.up.railway.app/api/health
```

Response should include:

- `"mongodb": "✅ Connected"`
- Your frontend URL in `corsOrigin`

### 4. Check Registration Logs

Register a vendor and check backend logs for:

```
📝 Vendor registration attempt: { email, businessName, origin, ... }
✅ Vendor registered successfully: { email, id }
```

If not present, the request was blocked by CORS before reaching your route.

## Common Mistakes

### ❌ Mistake 1: Wrong Frontend URL

```bash
# ❌ WRONG - Using localhost
CLIENT_URL=http://localhost:3000

# ✅ CORRECT - Using actual Vercel domain
CLIENT_URL=https://beetle-frontend.vercel.app
```

### ❌ Mistake 2: Vercel URL Without HTTPs

```bash
# ❌ WRONG
CLIENT_URL=http://beetle-frontend.vercel.app

# ✅ CORRECT
CLIENT_URL=https://beetle-frontend.vercel.app
```

### ❌ Mistake 3: Including /api Path

```bash
# ❌ WRONG
CLIENT_URL=https://beetle-frontend.vercel.app/api

# ✅ CORRECT - Just the domain
CLIENT_URL=https://beetle-frontend.vercel.app
```

### ❌ Mistake 4: Custom Domain Issues

If using a custom domain, make sure:

1. Domain is configured in Vercel
2. DNS records are updated
3. `CLIENT_URL` uses the custom domain exactly as deployed

```bash
# If custom domain is use.beetle.com
CLIENT_URL=https://use.beetle.com
```

## Testing After Fix

### 1. Reload Frontend

- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache

### 2. Test Vendor Registration

- Go to your frontend
- Click "Register as Vendor"
- Fill form and submit
- **Should see success message**

### 3. Test Rider Signup

- Go to "Become a Rider" page
- Fill form and submit
- **Should see success message**

### 4. Verify Database

- Check MongoDB Atlas
- Look for new Vendor documents
- Verify `email` and `businessName` match what you submitted

## If Still Not Working

### Enable Detailed Logging

On the backend, add this before the register route:

```javascript
app.use((req, res, next) => {
  console.log({
    method: req.method,
    path: req.path,
    origin: req.get("origin"),
    corsAllowed: req.get("origin") === process.env.CLIENT_URL,
  });
  next();
});
```

Redeploy and check logs again.

### Check Network Tab

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Attempt registration
4. Look for the `/api/auth/register` request
5. Check the **Response Headers** for CORS headers:
   - Should have: `access-control-allow-origin: https://your-frontend.com`

### Check Backend Logs

In Railway dashboard:

1. Select your backend service
2. Go to **Logs** tab
3. Look for `CORS blocked origin` messages
4. Compare the origin to your `CLIENT_URL` setting

---

## Quick Reference: Copy-Paste Solution

1. **Identify your Vercel domain** (check your Vercel dashboard)
2. **Go to Railway dashboard**
3. **Click Variables tab**
4. **Add these variables**:
   ```
   CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
   NODE_ENV=production
   ```
5. **Wait for redeployment** (usually 1-2 minutes)
6. **Test registration** (hard refresh in browser)

That's it! 🎉
