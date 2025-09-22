# Deployment Guide - WhatsDown Chat Application

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free tier available)
- Clerk account (free tier available)
- MongoDB Atlas account (free tier available)

### Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/whatsdown`

### Step 2: Set Up Clerk
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Configure the following URLs:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up` 
   - **After sign-in URL**: `/chat`
   - **After sign-up URL**: `/chat`
4. Copy your keys:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsdown
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. Deploy!

## 🔧 Manual Deployment Options

### Option 1: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - MONGODB_URI=${MONGODB_URI}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Deploy:
```bash
docker-compose up -d
```

### Option 2: Traditional VPS/Server

1. **Set up server** (Ubuntu 20.04+ recommended)
2. **Install Node.js 18+**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MongoDB**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Deploy application**:
```bash
git clone https://github.com/your-username/whatsdown.git
cd whatsdown
npm install
npm run build

# Create environment file
sudo nano /etc/environment
# Add your environment variables

# Start with PM2
npm install -g pm2
pm2 start npm --name "whatsdown" -- start
pm2 startup
pm2 save
```

5. **Set up Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Set up SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🌍 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb://localhost:27017/whatsdown-dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whatsdown-staging
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whatsdown
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📊 Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: For error tracking
- **LogRocket**: For user session replay

### Database Monitoring
- **MongoDB Atlas Monitoring**: Built-in charts and alerts
- **Custom metrics**: API response times, user activity

### Performance Monitoring
```javascript
// Add to your app for custom metrics
if (typeof window !== 'undefined') {
  // Track page load times
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime}ms`);
  });
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting Common Issues

### Socket.io Connection Issues
```javascript
// Add to your Socket.io client configuration
const socket = io(process.env.NEXT_PUBLIC_APP_URL, {
  transports: ['websocket', 'polling'], // Fallback to polling
  upgrade: true,
  rememberUpgrade: true,
});
```

### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Clerk Authentication Issues
- Verify environment variables are set correctly
- Check Clerk dashboard configuration
- Ensure URLs match your deployment domain

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple app instances
- Implement sticky sessions for Socket.io
- Consider Redis for session storage

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas for better performance
- Database indexing for frequently queried fields

### CDN & Caching
- Use Vercel Edge Network (automatic)
- Implement Redis caching for API responses
- Cache static assets with long TTL

---

This deployment guide covers various deployment scenarios from simple Vercel deployment to complex production setups. Choose the option that best fits your needs and scale as your application grows.
