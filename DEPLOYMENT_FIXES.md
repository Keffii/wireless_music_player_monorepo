# AWS Deployment - Corrected Instructions

## Issues Found & Fixed:

### ✅ Fixed Issues:

1. **Port mismatch**: Changed from 5000 to 8080 (matching Dockerfile EXPOSE)
2. **Removed Dockerrun.aws.json**: Not needed since we use Dockerfile directly
3. **Updated .ebignore**: Added exclusions for EB config files
4. **Verified amplify.yml**: Correct for monorepo structure

---

## Quick Start: Corrected Steps

### Backend Deployment (Elastic Beanstalk)

**1. Install EB CLI:**

Since `pip` failed, use this alternative method:

```powershell
# Download EB CLI installer
Invoke-WebRequest -Uri https://pypi.python.org/packages/source/a/awsebcli/awsebcli-installer-1.0.0.zip -OutFile ebcli-installer.zip

# Or use Chocolatey (if installed)
choco install awsebcli

# Or use MSI installer from:
# https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install-windows.html
```

**2. Configure AWS CLI:**

```powershell
# Install AWS CLI if not installed
winget install Amazon.AWSCLI

# Configure credentials
aws configure
# Enter:
# - Access Key ID
# - Secret Access Key  
# - Region: eu-central-1
# - Format: json
```

**3. Initialize & Deploy:**

```powershell
cd backend

# Initialize EB
eb init -p docker musicbox-backend --region eu-central-1

# Create environment with environment variables
eb create musicbox-backend-env --instance-type t2.micro --single `
  --envvars SPRING_DATASOURCE_URL=jdbc:mysql://music-box-db.cv6ma0uumbde.eu-central-1.rds.amazonaws.com:3306/wireless_music_player_db,SPRING_DATASOURCE_USERNAME=admin,SPRING_DATASOURCE_PASSWORD=YOUR_PASSWORD,AWS_REGION=eu-central-1,S3_BUCKET_NAME=YOUR_BUCKET,AWS_ACCESS_KEY_ID=YOUR_KEY,AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

**Important Notes:**
- Port is 8080 (not 5000) - matches Dockerfile
- Dockerfile is used directly (no Dockerrun.aws.json needed)
- Environment variables can be set via:
  - Command line (above)
  - AWS Console (safer for secrets)
  - `.ebextensions/environment.config` (not recommended for secrets)

---

### Frontend Deployment (Amplify)

The `amplify.yml` is correct! Follow these steps:

**1. Go to AWS Amplify Console:**
- https://console.aws.amazon.com/amplify/

**2. Connect GitHub:**
- Click "New app" → "Host web app"
- Choose GitHub
- Select repository: `wireless_music_player_monorepo`
- Select branch: `main`

**3. Configure Build:**
- **App name:** musicbox-frontend
- **Monorepo settings:**
  - ✅ Check "Deploying a monorepo?"
  - **Root directory:** `frontend`
- Build settings: Should auto-detect `amplify.yml`

**4. Add Environment Variables:**

```
REACT_APP_API_BASE=http://YOUR-EB-ENV.eu-central-1.elasticbeanstalk.com
REACT_APP_COGNITO_REGION=eu-central-1
REACT_APP_COGNITO_USER_POOL_ID=eu-central-1_9GKrnPnwt
REACT_APP_COGNITO_APP_CLIENT_ID=nbi6of817it1n1s6g2tfadlc6
```

Replace `YOUR-EB-ENV` with your actual Elastic Beanstalk environment URL.

**5. Deploy:**
- Click "Save and deploy"
- Wait 3-5 minutes
- You'll get a URL like: `https://main.xxxxx.amplifyapp.com`

---

### Post-Deployment: Update CORS

**1. Get your Amplify URL** from the deployment

**2. Update backend CORS:**

Edit `backend/src/main/java/com/example/media_controller_iot/config/CorsConfig.java`:

```java
.allowedOrigins(
    "http://localhost:3000",
    "http://localhost:8001", 
    "https://main.xxxxx.amplifyapp.com"  // ADD THIS
)
```

**3. Redeploy backend:**

```powershell
cd backend
eb deploy
```

---

## Key Corrections Made:

| Issue | Before | After |
|-------|--------|-------|
| Server Port | 5000 | 8080 (matches Dockerfile) |
| Dockerrun.aws.json | Included | Removed (not needed) |
| .ebignore | Basic | Added EB config exclusions |
| EB Proxy | nginx | none (Docker handles it) |

---

## Troubleshooting:

### If EB CLI install fails:

**Option 1: Use AWS Console UI** (No CLI needed!)
1. Go to Elastic Beanstalk Console
2. Click "Create Application"
3. Upload a ZIP of your backend folder
4. Select "Docker" platform
5. Configure environment variables in UI

**Option 2: Use AWS CloudShell**
1. Open AWS Console
2. Click CloudShell icon (top right)
3. Run EB CLI commands there

### If backend won't start:

```powershell
# Check logs
eb logs

# Common issues:
# 1. RDS security group not allowing EB
# 2. Wrong environment variables
# 3. Maven build failing

# SSH into instance to debug
eb ssh
sudo docker logs $(sudo docker ps -q)
```

### If frontend build fails:

- Check Amplify build logs in console
- Verify `amplify.yml` is in frontend folder
- Ensure all npm dependencies are in package.json
- Check environment variables are set

---

## Estimated Costs (Free Tier):

- ✅ Elastic Beanstalk: FREE (uses EC2 free tier)
- ✅ EC2 t2.micro: FREE (750 hours/month)
- ✅ Amplify: FREE (1000 build mins + 15GB served)
- ✅ RDS: FREE (750 hours/month) - you already have this
- ✅ S3: FREE (5GB) - you already have this

**Total: $0/month for first 12 months**

---

## Alternative: Simpler Deployment

If AWS is too complicated, consider:

**Render.com** (Truly free, no credit card):
1. Sign up at render.com
2. Connect GitHub
3. Create Web Service (backend) - auto-detects Dockerfile
4. Create Static Site (frontend) - auto-builds React
5. Done! No CLI, no complex setup

Would take 10 minutes vs 1+ hour with AWS setup issues.
