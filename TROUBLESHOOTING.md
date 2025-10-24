# Vercel Deployment Troubleshooting Guide

## Current Status

- ✅ **API Route Fixes**: All 3 API routes have `export const dynamic = 'force-dynamic'` added
- ✅ **Environment Variables Template**: `.env.production` created with secure secrets
- ✅ **Code Committed**: Fixes are in commit a9dba28
- ❓ **Vercel Deployment**: Still failing - need to see exact error

## Common Deployment Errors & Solutions

### 1. "Environment configuration is invalid"

**Cause**: Missing required environment variables in Vercel Dashboard

**Solution**:
1. Go to: https://vercel.com/peakmnas-projects/carmen/settings/environment-variables
2. Add ALL variables from `.env.production`:
   - Click "Add New"
   - Copy each variable name and value
   - Set Environment: Production (and optionally Preview/Development)
   - Click "Save"

**Critical Variables** (Add these first):
```env
JWT_SECRET=i7J8+oUKK94Wjzae8XgJyow55cYJlLWzsO1Sj2oS/1xFABbP//gDZWqwFfKI4gDM
JWT_REFRESH_SECRET=1Md5Ygps+865zq8Nt5turUO2KfDnSeGdbM1G2GTQtN8foJC8lLmtcqp6+wUejg6O
SESSION_SECRET=ElpFO0FPNd1QxmOhTyHuPdcsi2nc5xJndyslJsdh7FxU062L7g8UaciR6Mw8Hutv
ENCRYPTION_KEY=7568f2abea21ee89b8cd7560e646542e
NODE_ENV=production
```

**After adding variables**: Redeploy (Vercel should auto-deploy, or manually redeploy)

### 2. "Dynamic server usage" Errors

**Example Error**:
```
Error: Dynamic server usage: Route /api/inventory/analytics couldn't be rendered statically because it used `headers`
```

**Status**: ✅ **FIXED** in commit a9dba28

**What was fixed**:
- Added `export const dynamic = 'force-dynamic'` to:
  - `app/api/inventory/analytics/route.ts:15`
  - `app/api/price-management/validation/flags/route.ts:5`
  - `app/api/inventory/valuation/route.ts:16`

**If you still see this error**: Vercel is using old cached code. Solutions:
- Wait for new deployment to pick up latest commit
- Or manually redeploy: `vercel --prod --force`
- Or redeploy from Vercel Dashboard with "Redeploy" button

### 3. "RangeError: Invalid time value"

**Example Error**:
```
RangeError: Invalid time value at /procurement/purchase-requests
```

**Cause**: Invalid date value in mock data

**Solution**: This might be a secondary error from the main issue. Fix the primary error first (environment variables), then check if this persists.

### 4. "Functions cannot be passed to Client Components"

**Example Error**:
```
Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server"
```

**Cause**: Server functions passed to client components without proper marking

**Solution**: This is likely a code issue, not an environment issue. If this persists after fixing environment variables, we need to investigate specific components.

### 5. Database Connection Errors

**Example Error**:
```
Can't reach database server at `localhost:5435`
```

**Cause**: `DATABASE_URL` not configured for production database

**Solution**:
1. Get your production database URL (Vercel Postgres, Supabase, or other)
2. Update in Vercel Dashboard environment variables:
   ```env
   DATABASE_URL=postgresql://user:password@your-production-host:port/database
   ```
3. Redeploy

### 6. Build Timeout (60+ seconds)

**Example Error**:
```
⚠ Restarted static page generation for /system-administration/certifications because it took more than 60 seconds
```

**Possible Causes**:
- Heavy database operations during static generation
- Infinite loops or performance issues
- Memory constraints

**Solutions**:
- Mark problematic routes as dynamic: `export const dynamic = 'force-dynamic'`
- Optimize data fetching queries
- Add `generateStaticParams` for dynamic routes
- Use ISR (Incremental Static Regeneration) instead of SSG

### 7. Old Cached Build

**Symptom**: Fixes are in code but deployment still shows old errors

**How to Detect**:
- Check deployment timestamp
- Compare with commit timestamp
- Look for errors that were already fixed

**Solutions**:
1. **Wait for automatic deployment** (Vercel auto-deploys on git push)
2. **Manual deployment with force flag**:
   ```bash
   vercel --prod --force
   ```
3. **Redeploy from Vercel Dashboard**:
   - Go to deployment
   - Click "..." (three dots menu)
   - Click "Redeploy"
   - Check "Use existing Build Cache" OFF

## Verification Checklist

After each fix, verify:

- [ ] Build logs show no "Environment configuration is invalid" errors
- [ ] No "Dynamic server usage" errors
- [ ] Build completes without timeouts
- [ ] Deployment status shows "Ready" (green check)
- [ ] Application loads at production URL
- [ ] No console errors in browser

## Quick Diagnostic Commands

```bash
# Check recent deployments
vercel ls carmen --yes

# Check latest commit
git log --oneline -1

# Verify API route fixes
grep -n "export const dynamic" app/api/inventory/analytics/route.ts app/api/price-management/validation/flags/route.ts app/api/inventory/valuation/route.ts

# Trigger new deployment
vercel --prod --force
```

## Getting Help

If you encounter an error not covered here:

1. **Copy the full error message** from Vercel Dashboard
2. **Check the deployment timestamp** to ensure it's using latest code
3. **Verify environment variables** are correctly set in Vercel Dashboard
4. **Try a fresh deployment** with `vercel --prod --force`

## Next Steps

1. ✅ Add environment variables to Vercel Dashboard (from `.env.production`)
2. ✅ Verify latest deployment uses commit a9dba28 (check timestamp)
3. ✅ Check build logs for specific error messages
4. ✅ Update `DATABASE_URL` with production database credentials
5. ✅ Test the deployed application

## Support Resources

- **Vercel Dashboard**: https://vercel.com/peakmnas-projects/carmen
- **Environment Variables**: https://vercel.com/peakmnas-projects/carmen/settings/environment-variables
- **Deployment Logs**: Click on any deployment in dashboard to see detailed logs
- **Setup Guide**: See `VERCEL_SETUP.md` for step-by-step instructions
- **Deployment Checklist**: See `DEPLOYMENT_CHECKLIST.md` for complete checklist
