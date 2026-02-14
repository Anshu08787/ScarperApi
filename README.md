<div align="center">
  
  ![ScreenScape Banner](/public/assets/HOME.png)
  
  <h1>🎬 ScreenScape API</h1>
  <p><strong>A powerful, modern API service for scraping movie and anime content from multiple providers</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Anshu78780/ScarperApi/pulls)
  
  <a href="https://github.com/Anshu78780/ScarperApi/stargazers">
    <img src="https://img.shields.io/github/stars/Anshu78780/ScarperApi?style=social" alt="GitHub stars">
  </a>
  
  ---
  
  ### ⭐ If you find this project useful, please consider giving it a star! ⭐
  
  [🌐 Live Demo](https://screenscapeapi.dev) • [📖 Documentation](https://screenscapeapi.dev/dashboard/docs) • [🐛 Report Bug](https://github.com/Anshu78780/ScarperApi/issues) • [✨ Request Feature](https://github.com/Anshu78780/ScarperApi/issues)
  
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Supported Providers](#-supported-providers)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Performance & Optimization](#-performance--optimization)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Support](#-support)
- [Star History](#-star-history)

## ✨ Features

### Core Features
- 🔐 **Secure API Key Authentication** - JWT-based authentication with request quota management
- 📊 **Multiple Content Providers** - Support for 15+ providers including KMMovies, AnimeSalt, NetMirror, and more
- 🎯 **Comprehensive Endpoints** - Search, details, streaming links, and download options
- 🚀 **High Performance** - Built with Next.js 16 and modern optimizations with edge caching
- 📱 **Modern Dashboard** - User-friendly interface for API key management and documentation

### Advanced Features
- 🔄 **Real-time Updates** - Dynamic content scraping with intelligent caching strategies
- 📖 **Interactive Documentation** - Built-in API playground with TypeScript/JavaScript examples
- 🎨 **Beautiful UI** - Shadcn/ui components with Tailwind CSS and dark mode support
- 💾 **PostgreSQL Database** - Powered by Neon serverless PostgreSQL with Drizzle ORM
- 📧 **Email Notifications** - Automated login alerts and quota warnings with beautiful HTML emails
- 🔒 **Rate Limiting** - Intelligent quota management at both user and API key levels
- 📈 **Usage Analytics** - Track your API usage with detailed statistics
- 🌐 **Cross-Platform** - Works seamlessly on mobile, desktop, and tablets
- 🔍 **Smart Search** - Advanced search with filters and auto-suggestions
- 🎬 **Multiple Extractors** - Support for various video streaming platforms

## � Architecture

### System Architecture

```mermaid
graph TB
    subgraph Client["👤 Client Applications"]
        Web["🌐 Web Browser"]
        Mobile["📱 Mobile App"]
        API_Client["🔧 API Client"]
    end

    subgraph NextJS["⚡ Next.js App Router"]
        Pages["📄 Pages/Routes"]
        API["🔌 API Routes"]
        Auth["🔐 Authentication"]
    end

    subgraph Services["🛠 Services Layer"]
        Scrapers["🕷️ Web Scrapers"]
        Validators["✅ Validators"]
        Cache["💾 Cache Manager"]
        Email["📧 Email Service"]
    end

    subgraph Data["💽 Data Layer"]
        Neon[("🐘 Neon PostgreSQL")]
        Redis[("⚡ Upstash Redis")]
    end

    subgraph External["🌍 External Sources"]
        Providers["🎬 Content Providers"]
        Extractors["🎥 Video Extractors"]
    end

    Client --> NextJS
    NextJS --> Services
    Services --> Data
    Services --> External
    
    Auth --> Neon
    API --> Validators
    Validators --> Cache
    Cache --> Redis
    Scrapers --> Providers
    Scrapers --> Extractors

    style Client fill:#e1f5ff
    style NextJS fill:#fff3e0
    style Services fill:#f3e5f5
    style Data fill:#e8f5e9
    style External fill:#fce4ec
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant C as 🌐 Client
    participant A as 🔐 Auth API
    participant DB as 💾 Database
    participant E as 📧 Email Service

    U->>C: Login Request
    C->>A: POST /api/auth/login
    A->>DB: Verify Credentials
    DB-->>A: User Data
    A->>DB: Create Session
    A->>E: Send Login Alert
    E-->>U: Email Notification
    A-->>C: Session Token
    C-->>U: Login Success

    Note over U,E: API Key Generation
    U->>C: Generate API Key
    C->>A: POST /api/keys
    A->>DB: Verify Session
    A->>DB: Create API Key
    DB-->>A: API Key Data
    A-->>C: API Key
    C-->>U: Display Key
```

### API Request Flow

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant M as 🛡️ Middleware
    participant A as 🔌 API Handler
    participant V as ✅ Validator
    participant S as 🕷️ Scraper
    participant Ch as 💾 Cache
    participant P as 🌐 Provider

    C->>M: API Request + Key
    M->>V: Validate API Key
    V->>Ch: Check Request Quota
    
    alt Quota Exceeded
        V-->>C: 429 Quota Exceeded
    else Valid Request
        V->>Ch: Check Cache
        
        alt Cache Hit
            Ch-->>A: Cached Data
            A-->>C: Response
        else Cache Miss
            A->>S: Scrape Request
            S->>P: Fetch Content
            P-->>S: HTML Response
            S->>S: Parse Data
            S->>Ch: Store Cache
            S-->>A: Parsed Data
            A-->>C: Response
        end
        
        V->>V: Update Quota
    end
```

### Database Schema

```mermaid
erDiagram
    USER ||--o{ API_KEY : has
    USER ||--o{ SESSION : has
    USER {
        string id PK
        string email
        string name
        int totalRequestCount
        int totalRequestQuota
        timestamp createdAt
        timestamp lastQuotaWarningAt
    }
    
    API_KEY {
        string id PK
        string key UK
        string userId FK
        string name
        int requestCount
        int requestQuota
        boolean isActive
        timestamp lastUsedAt
        timestamp createdAt
    }
    
    SESSION {
        string id PK
        string userId FK
        string token UK
        timestamp expiresAt
        timestamp createdAt
    }
```

## 📱 Screenshots

<div align="center">

### Mobile Application

<table>
  <tr>
    <td align="center">
      <img src="/public/MOBILE/HOME.png" width="200" alt="Mobile Home"/>
      <br />
      <sub><b>Home Screen</b></sub>
    </td>
    <td align="center">
      <img src="/public/MOBILE/SEARCH.png" width="200" alt="Search"/>
      <br />
      <sub><b>Search & Discovery</b></sub>
    </td>
    <td align="center">
      <img src="/public/MOBILE/PLAYER.png" width="200" alt="Player"/>
      <br />
      <sub><b>Video Player</b></sub>
    </td>
    <td align="center">
      <img src="/public/MOBILE/info.png" width="200" alt="Info"/>
      <br />
      <sub><b>Content Details</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="/public/MOBILE/PROVIDER.png" width="200" alt="Providers"/>
      <br />
      <sub><b>Content Providers</b></sub>
    </td>
    <td align="center">
      <img src="/public/MOBILE/SERVERS.png" width="200" alt="Servers"/>
      <br />
      <sub><b>Server Selection</b></sub>
    </td>
    <td align="center">
      <img src="/public/MOBILE/SETTINGS.png" width="200" alt="Settings"/>
      <br />
      <sub><b>Settings</b></sub>
    </td>
  </tr>
</table>

### Desktop Application

<table>
  <tr>
    <td align="center" colspan="2">
      <img src="/public/assets/HOME.png" width="600" alt="Desktop Home"/>
      <br />
      <sub><b>Desktop Dashboard</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="/public/assets/PLAYER.png" width="400" alt="Desktop Player"/>
      <br />
      <sub><b>Video Player</b></sub>
    </td>
    <td align="center">
      <img src="/public/assets/INFO.png" width="400" alt="Content Info"/>
      <br />
      <sub><b>Content Information</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="/public/assets/EPS.png" width="400" alt="Episodes"/>
      <br />
      <sub><b>Episode Browser</b></sub>
    </td>
    <td align="center">
      <img src="/public/assets/PLAYERCONTROLS.png" width="400" alt="Controls"/>
      <br />
      <sub><b>Player Controls</b></sub>
    </td>
  </tr>
</table>

</div>

## �🎯 Supported Providers

### Movies & TV Shows
- **KMMovies** - Latest Bollywood, Hollywood, and dubbed movies
  - Homepage listings with pagination
  - Advanced search functionality
  - Detailed movie information with IMDb ratings
  - Multiple quality download links (480p, 720p, 1080p, 4K)
  - Magic links resolver for direct downloads

- **NetMirror** - Streaming content with multiple servers
  - Homepage content with categories
  - Search functionality
  - Post details with metadata
  - Stream links with playlist URLs

### Anime
- **AnimeSalt** - Comprehensive anime database
  - Latest anime releases
  - Episode listings
  - Streaming and download links
  - Search with filters

## 🛠 Tech Stack

### Core Technologies
- **Framework:** [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Runtime:** Node.js 18+

### Frontend
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible components
- **Icons:** [Lucide React](https://lucide.dev/) - Clean and consistent icons
- **Animations:** [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **3D Graphics:** [Three.js](https://threejs.org/) + React Three Fiber - 3D visualizations

### Backend & Database
- **Authentication:** [Better Auth](https://better-auth.com/) - Modern auth library
- **Database:** [Neon PostgreSQL](https://neon.tech/) - Serverless PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- **Caching:** [Upstash Redis](https://upstash.com/) - Serverless Redis

### API & Scraping
- **Web Scraping:** [Cheerio](https://cheerio.js.org/) - Fast HTML parser
- **HTTP Client:** [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Validation:** [Zod](https://zod.dev/) - TypeScript-first schema validation
- **API Validation:** Custom middleware with quota management

### Email & Communication
- **Email Service:** [Resend](https://resend.com/) - Modern email API
- **Email Templates:** React Email components

### DevOps & Deployment
- **Deployment:** [Vercel](https://vercel.com/) - Edge network deployment
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics
- **Error Tracking:** Built-in logging

## 🚀 Getting Started

### Quick Start (3 minutes)

```bash
# 1. Clone and install
git clone https://github.com/Anshu78780/ScarperApi.git
cd ScarperApi
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Setup database
npm run db:push

# 4. Start development server
npm run dev
```

🎉 Visit [http://localhost:3000](http://localhost:3000)

### Detailed Setup

<details>
<summary><b>📋 Prerequisites</b></summary>

Before you begin, ensure you have the following installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Database** ([Neon](https://neon.tech/) recommended - free tier available)

</details>

<details>
<summary><b>1️⃣ Clone Repository</b></summary>

```bash
git clone https://github.com/Anshu78780/ScarperApi.git
cd ScarperApi
```

</details>

<details>
<summary><b>2️⃣ Install Dependencies</b></summary>

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

</details>

<details>
<summary><b>3️⃣ Environment Setup</b></summary>

Create environment file:
```bash
cp .env.example .env.local
```

Get your Neon database URL:
1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string

Edit `.env.local`:
```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth (Required)
BETTER_AUTH_SECRET="generate-a-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Email Service (for notifications)
RESEND_API_KEY="your-resend-api-key"

# Optional: OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

Generate a secure secret:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

</details>

<details>
<summary><b>4️⃣ Database Migrations</b></summary>

Run database migrations to create tables:
```bash
npm run db:push
```

This will create all necessary tables in your Neon database.

</details>

<details>
<summary><b>5️⃣ Start Development Server</b></summary>

```bash
npm run dev
```

The application will be available at:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:3000/api](http://localhost:3000/api)

</details>

<details>
<summary><b>6️⃣ Create Your First Account</b></summary>

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create an account
3. Log in at [http://localhost:3000/login](http://localhost:3000/login)
4. Go to Dashboard → APIs to generate your first API key
5. Start making requests! 🎉

</details>

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:push

# Generate database migrations
npm run db:generate

# Open Drizzle Studio (Database GUI)
npm run db:studio

# Lint code
npm run lint
```

## 📚 API Documentation

Access the interactive API documentation at `/dashboard/docs` after logging in.

### Quick API Usage

#### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('https://screenscapeapi.dev/api/kmmovies/search?q=inception', {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

#### Python
```python
import requests

url = "https://screenscapeapi.dev/api/kmmovies/search"
params = {"q": "inception"}
headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)
```

#### cURL
```bash
curl -X GET "https://screenscapeapi.dev/api/kmmovies/search?q=inception" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

#### Node.js (Axios)
```javascript
const axios = require('axios');

axios.get('https://screenscapeapi.dev/api/kmmovies/search', {
  params: { q: 'inception' },
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### Available Endpoints

#### KMMovies
- `GET /api/kmmovies` - Latest releases
- `GET /api/kmmovies/search?q={query}` - Search movies
- `GET /api/kmmovies/details?url={url}` - Movie details
- `GET /api/kmmovies/magiclinks?url={url}` - Download links

#### AnimeSalt
- `GET /api/animesalt` - Latest anime
- `GET /api/animesalt/search?q={query}` - Search anime
- `GET /api/animesalt/details?url={url}` - Anime details
- `GET /api/animesalt/stream?url={url}` - Streaming links

#### NetMirror
- `GET /api/netmirror` - Homepage content
- `GET /api/netmirror/search?q={query}` - Search content
- `GET /api/netmirror/getpost?id={id}` - Post details
- `GET /api/netmirror/stream?id={id}` - Stream URLs

## 🔐 Authentication

All API endpoints require authentication via API keys.

### Getting an API Key

1. Sign up at `/signup`
2. Log in at `/login`
3. Navigate to `/dashboard/apis`
4. Generate a new API key
5. Copy and use in your requests

### Authentication Methods

**Header (Recommended)**
```bash
curl -H "x-api-key: YOUR_API_KEY" https://screenscapeapi.dev/api/kmmovies
```

**Query Parameter**
```bash
curl "https://screenscapeapi.dev/api/kmmovies?api_key=YOUR_API_KEY"
```

**Session (Dashboard)**
Automatic when logged into the dashboard

## 🔧 Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required Variables

```env
# Database Configuration (Required)
# Get from: https://neon.tech/
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Better Auth Configuration (Required)
# Generate a random 32-byte base64 string
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"

# Application URL (Required)
# Development: http://localhost:3000
# Production: https://your-domain.com
BETTER_AUTH_URL="http://localhost:3000"
```

### Optional Variables

```env
# Email Service (Optional - for notifications)
# Get from: https://resend.com/
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# OAuth Providers (Optional)
# GitHub OAuth - Get from: https://github.com/settings/developers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Rate Limiting (Optional - defaults shown)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds

# Cookie Management (Optional)
COOKIES_URL="https://your-cookies-endpoint.com/cookies.json"

# Application Settings (Optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ScreenScape API"

# Redis Cache (Optional - for enhanced caching)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### Environment Setup Guide

<details>
<summary><b>🔑 How to get DATABASE_URL (Neon PostgreSQL)</b></summary>

1. Go to [Neon](https://neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Navigate to your project dashboard
5. Copy the connection string from the dashboard
6. It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

</details>

<details>
<summary><b>🔐 How to generate BETTER_AUTH_SECRET</b></summary>

Use one of these methods to generate a secure random secret:

**Option 1: OpenSSL (Linux/Mac)**
```bash
openssl rand -base64 32
```

**Option 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit [Generate Random](https://generate-random.org/api-key-generator) and generate a 32+ character key

</details>

<details>
<summary><b>📧 How to get RESEND_API_KEY</b></summary>

1. Go to [Resend](https://resend.com/)
2. Sign up for a free account (100 emails/day free)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

</details>

<details>
<summary><b>🔗 How to get GitHub OAuth credentials</b></summary>

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000` (dev) or your domain
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Generate a Client Secret and copy it

</details>

### Example `.env.local` File

```env
# Minimal setup for development
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
BETTER_AUTH_SECRET="super-secret-key-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Enable email notifications
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxx"

# Optional: Enable GitHub OAuth
GITHUB_CLIENT_ID="github_client_id_here"
GITHUB_CLIENT_SECRET="github_client_secret_here"
```

## 🌐 Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Anshu78780/ScarperApi)

#### Step-by-Step Vercel Deployment

1. **Fork this repository**
   ```bash
   # Click the Fork button on GitHub
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" -> "Project"
   - Import your forked repository

3. **Configure Environment Variables**
   Add the following in Vercel project settings:
   ```env
   DATABASE_URL=your_neon_database_url
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your API is live! 🎉

5. **Run Database Migrations**
   ```bash
   # After deployment, run migrations
   npm run db:push
   ```

### Deploy on Render

#### Step-by-Step Render Deployment

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" -> "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   Name: screenscape-api
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Add Environment Variables**
   ```env
   DATABASE_URL=your_neon_database_url
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=https://your-app.onrender.com
   NODE_VERSION=18
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Access your API at `https://your-app.onrender.com`

### Deploy on Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DATABASE_URL="your_database_url"
railway variables set BETTER_AUTH_SECRET="your_secret"

# Deploy
railway up
```

### Docker Deployment

```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t screenscape-api .
docker run -p 3000:3000 --env-file .env screenscape-api
```

### Manual Deployment

```bash
# Clone repository
git clone https://github.com/Anshu78780/ScarperApi.git
cd ScarperApi

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

## 🚀 Performance & Optimization

### Caching Strategy
- **Provider Cache**: 30-minute TTL for content listings
- **Search Results**: 15-minute TTL
- **Video Links**: 5-minute TTL
- **Static Assets**: CDN caching with Vercel Edge Network

### Performance Metrics
- **API Response Time**: < 200ms (cached)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 95+

### Optimization Features
- Edge caching for API responses
- Database connection pooling
- Lazy loading for images
- Code splitting for faster page loads
- Gzip compression
- Serverless functions for scalability

## 🗪author️ Roadmap

### ✅ Completed
- [x] Basic scraping functionality
- [x] User authentication system
- [x] API key management
- [x] Quota system
- [x] Email notifications
- [x] Interactive documentation
- [x] Mobile responsive design
- [x] Dark mode support

### 🚧 In Progress
- [ ] GraphQL API support
- [ ] WebSocket for real-time updates
- [ ] Advanced analytics dashboard
- [ ] API versioning

### 🔮 Future Plans
- [ ] OAuth provider integration
- [ ] Webhook support
- [ ] Custom scraper plugins
- [ ] AI-powered content recommendations
- [ ] Multi-language support
- [ ] API playground improvements
- [ ] Rate limiting with Redis
- [ ] Monitoring and alerting
- [ ] API documentation generator
- [ ] SDK for popular languages (Python, Go, Ruby)

### 💡 Community Requests
Have an idea? [Open an issue](https://github.com/Anshu78780/ScarperApi/issues) or start a [discussion](https://github.com/Anshu78780/ScarperApi/discussions)!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Support

### Get Help
- 💬 **GitHub Discussions**: [Ask questions and share ideas](https://github.com/Anshu78780/ScarperApi/discussions)
- 🐛 **Issue Tracker**: [Report bugs](https://github.com/Anshu78780/ScarperApi/issues)
- 📧 **Email**: anshu78780@gmail.com
- 📖 **Documentation**: [Read the docs](https://screenscapeapi.dev/dashboard/docs)

### FAQ

<details>
<summary><b>How do I get an API key?</b></summary>
<br>
Sign up at the website, log in, and navigate to the dashboard to generate your API key.
</details>

<details>
<summary><b>What are the rate limits?</b></summary>
<br>
Free tier: 10,000 requests/month. Premium plans available with higher quotas.
</details>

<details>
<summary><b>Can I use this in production?</b></summary>
<br>
Yes! The API is production-ready. For commercial use, please review the license terms.
</details>

<details>
<summary><b>How do I report a bug?</b></summary>
<br>
Open an issue on GitHub with detailed information about the bug and steps to reproduce.
</details>

### Security
Found a security vulnerability? Please email anshu78780@gmail.com instead of opening a public issue.

## 🚀 Star History

<div align="center">

### ⭐ Star History Chart

[![Star History Chart](https://api.star-history.com/svg?repos=Anshu78780/ScarperApi&type=Date)](https://star-history.com/#Anshu78780/ScarperApi&Date)

### 🎆 Contributors & Stargazers

<a href="https://github.com/Anshu78780/ScarperApi/stargazers">
  <img src="https://reporoster.com/stars/dark/Anshu78780/ScarperApi" alt="Stargazers repo roster for @Anshu78780/ScarperApi" />
</a>

<a href="https://github.com/Anshu78780/ScarperApi/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Anshu78780/ScarperApi" alt="Contributors" />
</a>

### 📊 Repository Stats

![GitHub forks](https://img.shields.io/github/forks/Anshu78780/ScarperApi?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/Anshu78780/ScarperApi?style=for-the-badge)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Anshu78780/ScarperApi?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/Anshu78780/ScarperApi?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Anshu78780/ScarperApi?style=for-the-badge)

</div>

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Neon](https://neon.tech/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Better Auth](https://better-auth.com/)

---

<div align="center">
  
  <h3>🚀 Built with passion by <a href="https://github.com/Anshu78780">Anshu</a></h3>
  
  <p>
    <a href="https://github.com/Anshu78780/ScarperApi/stargazers">
      <img src="https://img.shields.io/github/stars/Anshu78780/ScarperApi?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41" alt="Stars">
    </a>
    <a href="https://github.com/Anshu78780/ScarperApi/issues">
      <img src="https://img.shields.io/github/issues/Anshu78780/ScarperApi?style=for-the-badge&logo=gitbook&color=B5E8E0&logoColor=D9E0EE&labelColor=302D41" alt="Issues">
    </a>
    <a href="https://github.com/Anshu78780/ScarperApi/network/members">
      <img src="https://img.shields.io/github/forks/Anshu78780/ScarperApi?style=for-the-badge&logo=git&color=F2CDCD&logoColor=D9E0EE&labelColor=302D41" alt="Forks">
    </a>
  </p>
  
  <p>
    If you found this project helpful, please consider giving it a ⭐ star!
  </p>
  
  <p>
    <a href="#top">
      <img src="https://img.shields.io/badge/Back%20to%20Top-↑-blue?style=for-the-badge" alt="Back to top">
    </a>
  </p>
  
  <sub>Made with ❤️ and ☕</sub>
  
</div>
