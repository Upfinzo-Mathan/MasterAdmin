MasterAdminPanel Architecture

Overview
- Multi-tenant SaaS with database-per-tenant isolation on MongoDB Atlas.
- SuperAdmin manages Admin tenants in master database `superadmin_db`.
- Each Admin authenticates and is routed to their own database via dynamic Mongoose connections.

Components
- Backend: Node.js, Express, Mongoose, JWT, Bcrypt.
- Frontend: React (Vite), React Router, Axios.
- Hosting: Vercel (frontend), Render/Railway (backend).

Data Model
- Master DB (`superadmin_db`): `Admin` collection
  - username (unique), passwordHash, dbName (unique), email, isActive.
- Tenant DB (`tenant_<username>` by default): `User` collection (example CRUD).

Auth
- SuperAdmin: token payload `{ role: 'superadmin', username }`.
- Admin: token payload `{ role: 'admin', username, dbName, adminId }`.
- Stored in `localStorage` on the client. Set `Authorization: Bearer <token>` headers.

Environment Variables
- Backend
  - `PORT` (default 4000)
  - `MONGO_URI` (Atlas connection string; DB name is selected dynamically)
  - `JWT_SECRET`
  - `CORS_ORIGIN` (e.g., http://localhost:5173)
  - `SUPERADMIN_USER`, `SUPERADMIN_PASS` (bootstrap superadmin)
- Frontend
  - `VITE_API_URL` (e.g., http://localhost:4000/api)

API
- `POST /api/superadmin/login` -> { token }
- `POST /api/superadmin/create-admin` (superadmin) -> { id, username, dbName, email }
- `GET /api/superadmin/admins` (superadmin)
- `DELETE /api/superadmin/admins/:id` (superadmin)
- `POST /api/admin/login` -> { token, dbName }
- `GET/POST/PUT/DELETE /api/admin/users[...]` (admin) CRUD

Dynamic Databases
- MongoDB Atlas creates databases on first write; explicit provisioning is not required.
- We connect using the same cluster URI and pass a per-tenant `dbName` when creating a Mongoose connection.
- Optionally, to create Atlas database users per tenant, integrate Atlas Admin API (not included here).

Local Development
1) Backend
- `cd MasterAdminPanel/backend`
- Create `.env` with variables above.
- `npm i`
- `npm run dev`

2) Frontend
- `cd MasterAdminPanel/frontend`
- Create `.env` with `VITE_API_URL=http://localhost:4000/api`.
- `npm i`
- `npm run dev`

Deployment Notes
- Backend: Render/Railway
  - Set environment variables.
  - Ensure CORS allows your Vercel domain.
- Frontend: Vercel
  - Set `VITE_API_URL` to your deployed backend `/api` URL.

Security Considerations
- Always hash passwords with bcrypt.
- Rotate `JWT_SECRET` and prefer short token TTLs.
- Consider HTTP-only cookies for tokens in production.
- If enabling Atlas per-tenant database users, restrict permissions to each tenant database.

Extending
- Add more tenant collections by extending `TenantModels` and controllers.
- Add email notifications on admin creation using a provider (e.g., SendGrid) in `createAdmin`.
- Add themes on the frontend with CSS variables or a UI library.

