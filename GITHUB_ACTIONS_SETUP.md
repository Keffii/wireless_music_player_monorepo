# GitHub Actions + Lightsail Quick Start Guide

This guide will help you deploy using GitHub Actions - **no Docker needed on your PC!**

---

## Part 1: Set Up AWS Infrastructure (One-Time Setup)

⏱️ **Estimated time: 30-40 minutes**

### Step 1: Create Lightsail Container Service (5 minutes)

This will host your Spring Boot backend.

1. **Open AWS Lightsail Console**
   - Go to: https://lightsail.aws.amazon.com/
   - Sign in with your AWS account

2. **Switch to Correct Region**
   - Look at top-right corner of console
   - Click the region dropdown
   - Select **EU (Frankfurt)** - `eu-central-1`
   - ⚠️ **Important**: Must match your RDS database region!

3. **Navigate to Containers**
   - In the Lightsail home page, click **Containers** in the left sidebar
   - Or click the **Containers** tab at the top

4. **Create Container Service**
   - Click orange **"Create container service"** button
   
5. **Configure Container Service**
   - **Region**: Should already be `eu-central-1` (Frankfurt)
   
   - **Container service capacity**:
     - Click **"Change your capacity"** if needed
     - **Power**: Select **Small** 
       - 512 MB RAM
       - 0.25 vCPU
       - **$7.00 USD/month**
     - **Scale**: **1** (1 node)
     - Monthly estimate shows: **$7.00 USD**
   
   - **Deployment**: 
     - Skip this for now (we'll deploy via GitHub Actions)
   
   - **Identify your service**:
     - **Container service name**: `music-player-backend`
     - ⚠️ Must be exactly this name (GitHub Actions expects it)
   
6. **Create Container Service**
   - Click orange **"Create container service"** button at bottom
   - You'll see a progress spinner
   - **Wait 3-5 minutes** - status will change from "Creating" to "Ready"
   - ✅ You should see green "Active" status

7. **Verify Creation**
   - You should see your service listed
   - Status: **Active** (green)
   - Public domain will be blank (added after first deployment)

---

### Step 2: Create S3 Bucket for Frontend (3 minutes)

This will host your React frontend files.

1. **Open S3 Console**
   - Go to: https://s3.console.aws.amazon.com/
   - Or search "S3" in AWS services search bar

2. **Create Bucket**
   - Click orange **"Create bucket"** button (top right)

3. **Configure Bucket - General**
   - **AWS Region**: `EU (Frankfurt) eu-central-1`
   - **Bucket name**: Choose a unique name
     - Example: `music-player-frontend-yourname`
     - Or: `music-player-frontend-2026`
     - Must be globally unique across all AWS
     - Only lowercase letters, numbers, and hyphens
   - 📝 **Write this name down!** You'll need it later

4. **Configure Bucket - Public Access**
   - **Object Ownership**: Leave default (ACLs disabled)
   
   - **Block Public Access settings**:
     - ⚠️ **UNCHECK** "Block all public access"
     - A warning appears - check "I acknowledge..."
     - This allows CloudFront to serve your website
   
   - **Bucket Versioning**: Disabled (default)
   - **Tags**: Skip (optional)
   - **Default encryption**: Keep default (SSE-S3)

5. **Create Bucket**
   - Click orange **"Create bucket"** button at bottom
   - ✅ You should see success message: "Successfully created bucket..."

---

### Step 3: Enable S3 Static Website Hosting (2 minutes)

Make your S3 bucket serve your React app.

1. **Open Your Bucket**
   - Click on your bucket name in the S3 console
   - You should see an empty bucket (0 objects)

2. **Go to Properties**
   - Click **"Properties"** tab at the top
   - Scroll all the way to the bottom

3. **Enable Static Website Hosting**
   - Find **"Static website hosting"** section (at bottom)
   - Click **"Edit"** button
   
   - **Static website hosting**: Select **Enable**
   
   - **Hosting type**: **Host a static website**
   
   - **Index document**: `index.html`
   
   - **Error document**: `index.html`
     - ⚠️ Important for React Router! (redirects 404s to app)
   
   - Click **"Save changes"**

4. **Copy Website Endpoint**
   - Scroll back to **"Static website hosting"** section
   - You should now see **"Bucket website endpoint"**
   - Example: `http://music-player-frontend-yourname.s3-website.eu-central-1.amazonaws.com`
   - 📝 **Copy this URL** - you'll need it for CloudFront

---

### Step 4: Add S3 Bucket Policy (2 minutes)

Allow public read access to your frontend files.

1. **Go to Permissions**
   - Click **"Permissions"** tab at the top

2. **Edit Bucket Policy**
   - Scroll to **"Bucket policy"** section
   - Click **"Edit"** button

3. **Add Policy**
   - Copy this JSON and paste it in the editor:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME-HERE/*"
       }
     ]
   }
   ```
   
   - ⚠️ **IMPORTANT**: Replace `YOUR-BUCKET-NAME-HERE` with your actual bucket name
   - Example: `"arn:aws:s3:::music-player-frontend-yourname/*"`
   - Note the `/*` at the end (allows access to all objects)

4. **Save Policy**
   - Click **"Save changes"**
   - You should see a warning banner: "This bucket has public access"
   - ✅ This is expected and correct!

---

### Step 5: Create CloudFront Distribution (10 minutes)

**Why?** Free HTTPS, global CDN, faster loading, custom domains

1. **Open CloudFront Console**
   - Go to: https://console.aws.amazon.com/cloudfront/
   - Or search "CloudFront" in AWS services

2. **Create Distribution**
   - Click orange **"Create distribution"** button

3. **Origin Settings**
   - **Origin domain**: 
     - ⚠️ **DO NOT** select your S3 bucket from dropdown
     - Instead, **paste your S3 website endpoint** (from Step 3)
     - Example: `music-player-frontend-yourname.s3-website.eu-central-1.amazonaws.com`
     - Remove `http://` if you copied it (just the domain)
   
   - **Protocol**: **HTTP only**
     - (S3 website endpoints don't support HTTPS origin)
   
   - **Name**: Auto-filled (leave as-is)

4. **Default Cache Behavior**
   - **Path pattern**: `Default (*)`
   
   - **Compress objects automatically**: **Yes**
   
   - **Viewer protocol policy**: **Redirect HTTP to HTTPS**
   
   - **Allowed HTTP methods**: **GET, HEAD, OPTIONS**
   
   - **Cache policy**: **CachingOptimized** (default)

5. **Function Associations**
   - Skip this section

6. **Settings**
   - **Price class**: **Use only North America and Europe**
     - Saves money, still covers most users
   
   - **AWS WAF**: **Do not enable security protections**
     - (Costs extra money)
   
   - **Alternate domain name (CNAME)**: Leave blank
     - (Or add your custom domain if you have one)
   
   - **Custom SSL certificate**: Default CloudFront Certificate
   
   - **Supported HTTP versions**: HTTP/2
   
   - **Default root object**: `index.html`
   
   - **Standard logging**: Off
   
   - **Description**: `Music Player Frontend` (optional)

7. **Create Distribution**
   - Click orange **"Create distribution"** button at bottom
   - You'll see "Status: Deploying"
   - **Wait 10-15 minutes** for status to change to "Enabled"
   - ☕ Good time for a coffee break!

8. **Copy Distribution Details**
   - Once enabled, find:
   - **Distribution domain name**: `d1234abcd5678.cloudfront.net`
     - 📝 **Copy this!** Your frontend URL
   - **Distribution ID**: `E1234ABCDEF`
     - 📝 **Copy this!** Needed for cache invalidation

9. **Configure Error Pages** (Important for React Router!)
   - Click on your distribution ID
   - Go to **"Error pages"** tab
   - Click **"Create custom error response"**
   
   - **First error response (404)**:
     - **HTTP error code**: **404: Not Found**
     - **Customize error response**: **Yes**
     - **Response page path**: `/index.html`
     - **HTTP response code**: **200: OK**
     - Click **"Create custom error response"**
   
   - **Second error response (403)**:
     - Click **"Create custom error response"** again
     - **HTTP error code**: **403: Forbidden**
     - **Customize error response**: **Yes**
     - **Response page path**: `/index.html`
     - **HTTP response code**: **200: OK**
     - Click **"Create custom error response"**
   
   - ✅ You should now see 2 custom error responses

---

### Step 6: Update RDS Security Group (3 minutes)

Allow Lightsail containers to connect to your database.

1. **Open RDS Console**
   - Go to: https://console.aws.amazon.com/rds/
   - Or search "RDS" in AWS services

2. **Find Your Database**
   - Click **"Databases"** in left sidebar
   - Click on your database: `music-box-db`

3. **Find Security Group**
   - Scroll to **"Connectivity & security"** section
   - Under **"Security"**, find **"VPC security groups"**
   - Click on the security group link (blue text)
     - Example: `sg-0123456789abcdef (default)`
   - This opens EC2 console

4. **Edit Inbound Rules**
   - Make sure your security group is selected (checkbox)
   - Click **"Edit inbound rules"** button at bottom

5. **Add MySQL Rule**
   - Click **"Add rule"** button
   
   - **Type**: Select **MySQL/Aurora** from dropdown
     - Auto-fills Port to **3306**
   
   - **Source**: Select **Custom** from dropdown
     - In the text box, type: `0.0.0.0/0`
     - This allows all IPs (Lightsail uses dynamic IPs)
   
   - **Description**: `Lightsail backend access`

6. **Save Rules**
   - Click orange **"Save rules"** button
   - ✅ You should see success message
   - Your database is now accessible from Lightsail

**⚠️ Security Note**: Using `0.0.0.0/0` is safe here because:
- Your database still requires username/password
- It's not exposed to the public internet (inside VPC)
- Lightsail containers use rotating IPs, so specific IPs won't work

---

### Step 7: Create IAM User for GitHub Actions (10 minutes)

GitHub Actions needs AWS credentials to deploy.

1. **Open IAM Console**
   - Go to: https://console.aws.amazon.com/iam/
   - Or search "IAM" in AWS services

2. **Create User**
   - Click **"Users"** in left sidebar
   - Click orange **"Create user"** button

3. **Specify User Details**
   - **User name**: `github-actions-deployer`
   - **Provide user access to AWS Management Console**: Leave **UNCHECKED**
     - (This user only needs API access, not console login)
   - Click orange **"Next"** button

4. **Set Permissions**
   - Select **"Attach policies directly"**
   - Use search box to find and check these 3 policies:
     - ✅ `AmazonLightsailFullAccess`
     - ✅ `AmazonS3FullAccess`
     - ✅ `CloudFrontFullAccess`
   - Tip: Type policy name in search to find quickly
   - Click orange **"Next"** button

5. **Review and Create**
   - Review the summary
   - Click orange **"Create user"** button
   - ✅ Success message: "User github-actions-deployer created"

6. **Create Access Key**
   - Click on the username **"github-actions-deployer"**
   - Go to **"Security credentials"** tab
   - Scroll to **"Access keys"** section
   - Click **"Create access key"**

7. **Select Use Case**
   - Select **"Third-party service"**
   - Check the disclaimer: "I understand..."
   - Click orange **"Next"** button

8. **Description (Optional)**
   - **Description tag**: `GitHub Actions deployment`
   - Click orange **"Create access key"** button

9. **Retrieve Access Keys**
   - ⚠️ **CRITICAL**: You can only see the secret key ONCE!
   - **Access key ID**: `AKIA...` (visible anytime)
   - **Secret access key**: `wJa...` (visible only now)
   
   - 📝 **SAVE BOTH IMMEDIATELY**:
     - Option 1: Click **"Download .csv file"**
     - Option 2: Copy both and save in password manager
     - Option 3: Leave this tab open until you add to GitHub
   
   - Click **"Done"**

✅ **Part 1 Complete!** You now have:
- Lightsail container service ready
- S3 bucket configured for frontend
- CloudFront distribution deployed
- RDS security group updated
- IAM user with access keys

📝 **You should have saved these values:**
- Frontend S3 bucket name
- CloudFront domain (d1234.cloudfront.net)
- CloudFront distribution ID
- AWS Access Key ID
- AWS Secret Access Key

**Next**: Configure GitHub repository secrets

---

## Part 2: Create AWS IAM User for GitHub Actions

GitHub Actions needs AWS credentials to deploy.

### Step 1: Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. **User name**: `github-actions-deployer`
4. Click **Next**

### Step 2: Attach Policies

Click **Attach policies directly** and add these policies:

- ✅ `AmazonLightsailFullAccess`
- ✅ `AmazonS3FullAccess`
- ✅ `CloudFrontFullAccess`

Click **Next** → **Create user**

### Step 3: Create Access Key

1. Click on the new user `github-actions-deployer`
2. Go to **Security credentials** tab
3. Scroll to **Access keys** → **Create access key**
4. **Use case**: Third-party service
5. Check the disclaimer → **Next**
6. **Description**: GitHub Actions deployment
7. **Create access key**
8. **⚠️ SAVE THESE - you won't see them again!**
   - Access key ID: `AKIA...`
   - Secret access key: `wJa...`

---

## Part 3: Configure GitHub Repository Secrets

### Step 1: Go to Repository Settings

1. Open your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Step 2: Add Required Secrets

Add each of these secrets one by one:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `SPRING_DATASOURCE_URL` | Your RDS connection URL | `jdbc:mysql://music-box-db.cv6ma0uumbde.eu-central-1.rds.amazonaws.com:3306/wireless_music_player_db` |
| `SPRING_DATASOURCE_USERNAME` | RDS username | `admin` |
| `SPRING_DATASOURCE_PASSWORD` | RDS password | `your-db-password` |
| `AWS_S3_BUCKET` | Your music files bucket | `wireless-music-player-files` |
| `COGNITO_USER_POOL_ID` | Cognito pool ID | `eu-central-1_9GKrnPnwt` |
| `COGNITO_APP_CLIENT_ID` | Cognito app client | `nbi6of817it1n1s6g2tfadlc6` |
| `FRONTEND_S3_BUCKET` | Frontend bucket name | `music-player-frontend-YOUR-NAME` |
| `CORS_ALLOWED_ORIGINS` | CloudFront URL (update after Step 5) | `https://d1234abcd.cloudfront.net` |
| `REACT_APP_API_BASE` | Backend URL (update after first deploy) | `https://music-player-backend.xxxxx.eu-central-1.cs.amazonlightsail.com` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (optional) | `E1234ABCDEFG` |
| `CLOUDFRONT_DOMAIN` | CloudFront domain (optional) | `d1234abcd.cloudfront.net` |

**Note**: You'll update `CORS_ALLOWED_ORIGINS` and `REACT_APP_API_BASE` after the first deployment.

---

## Part 4: First Deployment

### Step 1: Commit and Push

The GitHub Actions workflow is already created. Just push your code:

```powershell
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Step 2: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You'll see "Deploy to AWS Lightsail" running
4. Click on it to watch progress
5. **First deployment takes ~10-15 minutes**

### Step 3: Get Backend URL

After backend deployment completes:

1. Go to [Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **Containers** → `music-player-backend`
3. Copy the **Public domain** (e.g., `https://music-player-backend.xxxxx.eu-central-1.cs.amazonlightsail.com`)

### Step 4: Update GitHub Secrets

Now update these two secrets with real values:

1. Go to GitHub → Settings → Secrets → Actions
2. Edit `REACT_APP_API_BASE`:
   - Value: `https://music-player-backend.xxxxx.eu-central-1.cs.amazonlightsail.com`
3. Edit `CORS_ALLOWED_ORIGINS`:
   - Value: `https://d1234abcd.cloudfront.net` (your CloudFront domain)

### Step 5: Redeploy Frontend

Trigger a new deployment to pick up the updated backend URL:

```powershell
git commit --allow-empty -m "Update frontend with backend URL"
git push origin main
```

### Step 6: Test Your Application

1. Wait 2-3 minutes for CloudFront cache to clear
2. Open your CloudFront URL: `https://d1234abcd.cloudfront.net`
3. You should see your music player! 🎵

---

## Part 5: Future Deployments

### Deploy Changes

Just commit and push to `main` branch:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions automatically:
1. ✅ Builds Docker images in the cloud
2. ✅ Pushes to Lightsail
3. ✅ Deploys backend
4. ✅ Builds and deploys frontend to S3
5. ✅ Invalidates CloudFront cache

**No Docker needed on your PC!**

### Manual Deployment

If you want to trigger deployment manually:

1. Go to GitHub → Actions
2. Click "Deploy to AWS Lightsail"
3. Click "Run workflow" → Run workflow

---

## Troubleshooting

### Backend not starting

**Check logs:**
1. Lightsail Console → Containers → music-player-backend → Logs tab

**Common issues:**
- ❌ Wrong database password → Update `SPRING_DATASOURCE_PASSWORD` secret
- ❌ RDS security group blocking → Add 0.0.0.0/0 to inbound rules
- ❌ Wrong CORS origins → Update `CORS_ALLOWED_ORIGINS` secret

### Frontend shows blank page

**Check browser console:**
- ❌ CORS error → Backend CORS_ALLOWED_ORIGINS doesn't match CloudFront URL
- ❌ 404 on API calls → REACT_APP_API_BASE is wrong
- ❌ Blank page → Check CloudFront error pages (404/403 → /index.html)

**Quick fix:**
```powershell
# Rebuild and redeploy
git commit --allow-empty -m "Redeploy frontend"
git push
```

### GitHub Actions failing

**Check secrets:**
1. GitHub → Settings → Secrets → Actions
2. Verify all secrets are set correctly
3. Re-create `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if needed

**Check IAM permissions:**
- Ensure `github-actions-deployer` has Lightsail, S3, and CloudFront policies

---

## Cost Summary

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **Lightsail Container** | $7.00 | Backend (512MB RAM) |
| **S3 Storage** | ~$0.50 | Frontend files (~5MB) |
| **CloudFront** | ~$0.50 | First 1TB free, then $0.085/GB |
| **GitHub Actions** | $0.00 | 2,000 minutes/month free |
| **Total** | **~$8/month** | **Your $120 = 15 months!** |

---

## Summary

✅ **No Docker on your PC** - builds happen in GitHub cloud  
✅ **Automatic deployments** - just `git push`  
✅ **15 months hosting** with your $120 credits  
✅ **Professional workflow** - same as production apps  
✅ **Easy updates** - commit, push, done  

**You're all set! Just push to deploy! 🚀**
