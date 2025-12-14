# AWS Deployment Guide for Wireless Music Player

## Prerequisites
- AWS CLI installed: `winget install Amazon.AWSCLI`
- AWS account with credentials configured: `aws configure`
- Docker Desktop running

## Architecture
- **RDS MySQL 8.0** - Database (with public access for Grafana Cloud)
- **ECS Fargate** - Backend container
- **S3 + CloudFront** - Frontend static hosting
- **Application Load Balancer** - Routes traffic to backend
- **Grafana Cloud** - Connects to RDS MySQL

## Step 1: Create RDS MySQL Database

```bash
# Create RDS instance (takes 5-10 minutes)
aws rds create-db-instance \
  --db-instance-identifier wireless-music-player-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --publicly-accessible \
  --db-name wireless_music_player_db \
  --backup-retention-period 7 \
  --storage-encrypted
```

**Get RDS endpoint:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier wireless-music-player-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

## Step 2: Push Docker Images to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name wireless-music-player-backend

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag backend
cd backend
docker build -t wireless-music-player-backend .
docker tag wireless-music-player-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wireless-music-player-backend:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wireless-music-player-backend:latest
```

## Step 3: Deploy Backend to ECS Fargate

Use the provided `ecs-task-definition.json` and deploy via AWS Console or CLI.

## Step 4: Deploy Frontend to S3 + CloudFront

```bash
# Build frontend with production API URL
cd frontend
REACT_APP_API_BASE=https://your-alb-domain.us-east-1.elb.amazonaws.com npm run build

# Create S3 bucket
aws s3 mb s3://wireless-music-player-frontend

# Enable static website hosting
aws s3 website s3://wireless-music-player-frontend --index-document index.html

# Upload build
aws s3 sync build/ s3://wireless-music-player-frontend --acl public-read

# Create CloudFront distribution (optional, for HTTPS and CDN)
```

## Step 5: Configure Grafana Cloud

1. Go to https://keffii.grafana.net
2. Add MySQL data source:
   - **Host:** `your-rds-endpoint.rds.amazonaws.com:3306`
   - **Database:** `wireless_music_player_db`
   - **User:** `admin`
   - **Password:** `YourSecurePassword123!`

## Step 6: Insert Sample Songs

Connect to RDS and insert songs:
```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p wireless_music_player_db

INSERT INTO songs (title, artist, src_url, cover_url) VALUES 
('Better Day', 'penguinmusic', '/music/better-day-186374.mp3', '/cover/better-day.jpg'),
('Abstract Beauty', 'Grand_Project', '/music/abstract-beauty-378257.mp3', '/cover/abstract-beauty.jpg'),
('Cascade Breathe', 'NverAvetyanMusic', '/music/cascade-breathe-future-garage-412839.mp3', '/cover/cascade-breathe.jpg');
```

## Estimated AWS Costs (Monthly)
- RDS db.t3.micro: ~$15
- ECS Fargate (2 vCPU, 4GB): ~$30
- S3 + CloudFront: ~$1-5
- **Total: ~$50/month**

## Alternative: AWS Elastic Beanstalk (Simpler)
If you want easier deployment, use `eb-deploy.md` instead.
