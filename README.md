# 🛰️ HiddenAtlas Backend API — Node.js + Express + MongoDB

> **RESTful API backend for the HiddenAtlas travel discovery platform.**  
> Built with Node.js, Express, TypeScript, and MongoDB with Mongoose following Clean Architecture principles.

---

## 🌟 Features

* **Places API**:
  * `GET /api/places` — List approved destinations with filters (category, type, status, text search).
  * `GET /api/places/:id` — Fetch single place details.
  * `GET /api/places/search` — Full-text search across titles, descriptions, and tags.
  * `POST /api/places` — Submit a new place (supports authenticated users or guest demo explorer submissions via `optionalAuthenticate`).
  * `POST /api/places/saved` — Batch-resolve saved place IDs.
* **Auth API**:
  * `POST /api/auth/register` — Explorer registration with hashed passwords (bcrypt).
  * `POST /api/auth/login` — Authentication returning signed JWT.
  * `GET /api/auth/me` — Authenticated user profile retrieval.
  * `PUT /api/auth/profile` — Update user profile.
* **Automatic Database Seeding**:
  * Auto-seeds 19 initial destinations including Kozhikode Beach, Kerala demo destinations on first boot.
  * Auto-seeds 3 demo explorer accounts (`Elena`, `Mateo`, `Amina` with password `demo1234`).
* **Security & Health**:
  * Helmet security headers, CORS origin protection, Morgan logging, and `/health` monitoring route.

---

## 🏛️ Clean Architecture Structure

```
backend/
├── src/
│   ├── domain/                  # Enterprise Entities & Repository Interfaces
│   │   ├── entities/           # Place, User
│   │   └── repositories/       # IPlaceRepository, IUserRepository
│   ├── application/             # Application Use Cases
│   │   └── use-cases/          # GetAllPlaces, CreatePlace, GetPlaceById, AuthUseCases
│   ├── infrastructure/          # Database, Schemas, & Mongoose Repositories
│   │   ├── config/             # Environment variables (dotenv)
│   │   ├── database/           # Connection, PlaceModel, UserModel, seed data
│   │   └── repositories/       # MongoPlaceRepository, MongoUserRepository
│   └── presentation/            # Express Routers, Controllers, & Middleware
│       ├── controllers/        # PlaceController, AuthController
│       ├── middleware/         # authMiddleware (authenticate, optionalAuthenticate), errorHandler
│       └── routes/             # placeRoutes, authRoutes
└── index.ts                     # Composition root & server bootstrap
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: Running locally at `mongodb://localhost:27017` or a MongoDB Atlas URI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (or use defaults):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hiddenatlas
JWT_SECRET=hiddenatlas-secret-key-development-only
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

3. Start in development mode with hot-reloading:
```bash
npm run dev
```

4. Build and run in production:
```bash
npm run build
npm run start
```

### Health Check
Verify the server is running:
```bash
curl http://localhost:5000/health
```
Response:
```json
{ "status": "ok", "timestamp": "2026-10-11T..." }
```
