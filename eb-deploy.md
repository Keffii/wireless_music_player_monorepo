# AWS Elastic Beanstalk Deployment (Easier Alternative)

## Prerequisites
```bash
# Install EB CLI
pip install awsebcli

# Or via Chocolatey
choco install awsebcli
```

## Step 1: Initialize Elastic Beanstalk

```bash
cd backend

# Initialize EB application
eb init -p docker wireless-music-player-backend --region us-east-1

# Create environment with RDS
eb create production \
  --database \
  --database.engine mysql \
  --database.username admin \
  --database.password YourSecurePassword123! \
  --database.size 20
```

## Step 2: Configure Environment Variables

```bash
eb setenv \
  CORS_ALLOWED_ORIGINS=https://your-frontend-url.s3.amazonaws.com \
  SPRING_PROFILES_ACTIVE=prod
```

## Step 3: Deploy Backend

```bash
eb deploy
```

## Step 4: Get Backend URL

```bash
eb status
# Look for "CNAME" - this is your backend URL
```

## Step 5: Deploy Frontend to S3

```bash
cd ../frontend

# Build with backend URL
REACT_APP_API_BASE=http://your-eb-app.elasticbeanstalk.com npm run build

# Deploy to S3
aws s3 sync build/ s3://wireless-music-player-frontend --acl public-read
```

## Step 6: Get RDS Endpoint for Grafana Cloud

```bash
eb config --display

# Look for "RDS_HOSTNAME" in the output
```

## Connect Grafana Cloud

1. Go to https://keffii.grafana.net
2. Add MySQL data source:
   - **Host:** `RDS_HOSTNAME:3306`
   - **Database:** `ebdb` (default EB database name)
   - **User:** `admin`
   - **Password:** `YourSecurePassword123!`

## Benefits of Elastic Beanstalk
- ✅ Automatic RDS creation
- ✅ Automatic load balancing
- ✅ Auto-scaling
- ✅ One-command deployment
- ✅ Free tier eligible (first 12 months)

## Costs
- t3.micro instance: FREE (first 12 months) then ~$10/month
- RDS db.t3.micro: ~$15/month
- **Total: ~$25/month after free tier**
