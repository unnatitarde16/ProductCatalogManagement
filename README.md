# Product Catalog Management

Real full-stack React/TypeScript/Tailwind + Express/TypeScript + MongoDB/Mongoose application.

## Run
1. Install MongoDB and start the MongoDB service.
2. Backend: `cd backend` → `copy .env.example .env` → `npm install` → `npm run dev`.
3. Frontend in a second terminal: `cd frontend` → `copy .env.example .env` → `npm install` → `npm run dev`.
4. Open the Vite URL, normally http://localhost:5173.

The backend automatically creates an admin on an empty database: `admin@example.com` / `Admin@12345`. Change it for real use.

## APIs
POST /api/auth/register, POST /api/auth/login, GET /api/auth/me; GET/POST/PUT/DELETE /api/products; GET /api/products/analytics.

Products support search, category/status/price filters, sorting, backend pagination, CRUD, JWT authorization and MongoDB aggregation. Analytics use `$group`, `$sort`, `$project`, `$match` and conditional aggregation.

## Important
Product data is stored in MongoDB, not a static React array. Admin-only mutations and analytics are protected by JWT role checks. Passwords are hashed with bcrypt and never returned by normal user queries.
