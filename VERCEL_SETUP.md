# Vercel Environment Variables Setup Guide

## Quick Copy-Paste for Vercel Dashboard

Copy these environment variables to your Vercel project dashboard:

### 1. Security Variables (CRITICAL - Required for Build)

```
JWT_SECRET=i7J8+oUKK94Wjzae8XgJyow55cYJlLWzsO1Sj2oS/1xFABbP//gDZWqwFfKI4gDM
JWT_REFRESH_SECRET=1Md5Ygps+865zq8Nt5turUO2KfDnSeGdbM1G2GTQtN8foJC8lLmtcqp6+wUejg6O
SESSION_SECRET=ElpFO0FPNd1QxmOhTyHuPdcsi2nc5xJndyslJsdh7FxU062L7g8UaciR6Mw8Hutv
ENCRYPTION_KEY=7568f2abea21ee89b8cd7560e646542e
```

### 2. Database (Update with your production database)

```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Replace with your actual production database URL!**

### 3. Application Settings

```
NODE_ENV=production
CORS_ORIGIN=https://carmen-at43celqr-peakmnas-projects.vercel.app
```

### 4. All Other Variables (Copy from .env.production)

```
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
ENCRYPTION_ALGORITHM=aes-256-gcm
DB_CONNECTION_LIMIT=10
DB_POOL_TIMEOUT=10
DB_CIRCUIT_BREAKER=true
DB_MONITORING=true
DB_TIMEOUTS=true
DB_CB_FAILURE_THRESHOLD=5
DB_CB_TIMEOUT=60000
DB_HEALTH_CHECK_INTERVAL=30000
API_RATE_LIMIT_WINDOW=900
API_RATE_LIMIT_MAX_REQUESTS=1000
API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false
SECURITY_HEADERS_ENABLED=true
CORS_CREDENTIALS=true
CSP_ENABLED=true
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90
FAILED_LOGIN_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION=1800
DB_ALERT_HEALTH_SCORE_THRESHOLD=70
DB_ALERT_POOL_UTILIZATION_THRESHOLD=80
DB_ALERT_QUERY_TIME_THRESHOLD=1000
DB_ALERT_ERROR_RATE_THRESHOLD=5
DB_ALERT_CONNECTION_TIMEOUT_THRESHOLD=3
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
UPLOAD_PATH=./uploads
EMAIL_SERVICE=disabled
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_MULTI_CURRENCY=true
FEATURE_VENDOR_PORTAL=true
FEATURE_MOBILE_APP=false
ENABLE_METRICS=false
REDIS_DB=0
```

## How to Add to Vercel

1. Go to https://vercel.com/peakmnas-projects/carmen/settings/environment-variables

2. Click "Add New" for each variable

3. Set the environment to "Production" (or All if you want)

4. Paste the variable name and value

5. Click "Save"

## IMPORTANT Notes

- ✅ **NO AI API keys needed** (ANTHROPIC, OPENAI, etc. are optional)
- ⚠️ **UPDATE DATABASE_URL** with your production database
- 🔐 **These secrets are already secure** - generated with OpenSSL
- 🚀 **Redeploy after adding** environment variables

## After Adding Variables

Trigger a new deployment:
```bash
vercel --prod
```

Or wait for automatic deployment from GitHub push.

## Need Help?

- Vercel Dashboard: https://vercel.com/peakmnas-projects/carmen
- Deployment Logs: Check the "Deployments" tab for build errors
