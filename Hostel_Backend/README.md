# Hostel Management System - Backend

This repository contains a Node.js + Express + MongoDB backend for a "Hostel Management System" built with MVC structure.

Features
- Express.js server with centralized error handling
- Mongoose models for Admin, Student, FoodItem, DailyMeal, MonthlyPayment
- JWT authentication and role-based access control
- Password hashing with bcryptjs
- Input validation with Joi
- Security: CORS, Helmet; Logging: morgan

Getting started
1. Copy `.env.example` to `.env` and update variables.
2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

API base: `http://localhost:5000/api`

Endpoints
- Admin: `/api/admin/*`
- Students: `/api/students/*`
- FoodItems: `/api/fooditems/*`
- DailyMeals: `/api/dailymeals/*`
- Payments: `/api/payments/*`

Notes
- Create an initial admin using one of the methods below (recommended: script).
## Deployment (DigitalOcean)

Two recommended deployment options are provided: DigitalOcean App Platform (builds directly from your repo using the Dockerfile) or a Droplet using Docker/Docker Compose.

1) Deploy to DigitalOcean App Platform (recommended)
 - Ensure your repo is pushed to GitHub (or GitLab). App Platform can deploy from the repo.
 - The project includes a `Dockerfile` that the App Platform will use to build the container.
 - In DigitalOcean dashboard: Create → Apps → Connect GitHub repo → Select branch → In "Components" choose Container image, Dockerfile path (default `Dockerfile`) → Set environment variables from `.env` (PORT, MONGO_URI, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN).
 - Deploy. App Platform will build and run the container.

2) Deploy to a DigitalOcean Droplet (Docker)
 - Create a Droplet with Docker installed (or use Docker One-Click).
 - Copy repository to the Droplet or pull from GitHub.
 - Create a `.env` on the droplet with the production values.
 - Build and run with Docker Compose (compose file is included):

```bash
# on droplet
docker compose up -d --build
```

 - The app will run on port 5000 (map to a public port or configure a reverse proxy like Nginx with TLS).

3) Build & push to a container registry (Docker Hub) and use DO to deploy
 - Build and push image:
```bash
docker build -t yourdockerhubusername/hostel-backend:latest .
docker push yourdockerhubusername/hostel-backend:latest
```
 - In DigitalOcean App Platform create a component from container image, point to your Docker Hub image and set environment variables.

Notes & security
 - Do NOT commit `.env` to the repo; use DigitalOcean environment variable UI or secrets for production values.
 - Ensure `JWT_SECRET` is strong and kept secret.
 - For production, add TLS (App Platform handles TLS; on Droplet use Nginx with Let's Encrypt).

Create initial admin (recommended)
- Script: `scripts/create-admin.js` — run after installing dependencies to create the first admin quickly.

Usage (PowerShell / bash):
```bash
# from project root
npm install
node scripts/create-admin.js admin@example.com adminPassword "Admin Name" ADM001
```

The script will print the email/password to use and a curl command to login and obtain a JWT.

Alternative: enable one-time public creation
- If you prefer to create via API, temporarily remove authentication middleware from `/api/admin/create` in `src/routes/adminRoutes.js`, POST the admin, then revert the change.
- JWT tokens are returned from `POST /api/admin/login`.

This scaffold is a starting point. For production, add rate limiting, stronger validation, logging to files, tests, and CI.
