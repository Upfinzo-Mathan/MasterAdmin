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
- Backend (Required: Create `backend/.env` file)
  - `PORT` (default 4000, optional)
  - `MONGO_URI` (REQUIRED - Atlas connection string; DB name is selected dynamically)
  - `JWT_SECRET` (REQUIRED - Long random secret for JWT signing)
  - `CORS_ORIGIN` (e.g., http://localhost:5173, optional, defaults to '*')
  - `SUPERADMIN_USER` (REQUIRED - SuperAdmin username for login)
  - `SUPERADMIN_PASS` (REQUIRED - SuperAdmin password for login)
  
  Example `backend/.env`:
  ```
  PORT=4000
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
  JWT_SECRET=your-very-long-random-secret-key-here
  CORS_ORIGIN=http://localhost:5173
  SUPERADMIN_USER=admin
  SUPERADMIN_PASS=your-secure-password
  ```
- Frontend (Required: Create `frontend/.env` file)
  - `VITE_API_URL` (REQUIRED - e.g., http://localhost:4000/api)
  
  Example `frontend/.env`:
  ```
  VITE_API_URL=http://localhost:4000/api
  ```

API

SuperAdmin Endpoints (Require SuperAdmin credentials from `.env` file)
- `POST /api/superadmin/login` 
  - Body: `{ username, password }` (must match `SUPERADMIN_USER` and `SUPERADMIN_PASS` from `.env`)
  - Returns: `{ token }`
  - Error: `500 - "SuperAdmin not configured"` if env vars missing
  - Error: `401 - "Invalid credentials"` if username/password don't match
  
- `POST /api/superadmin/create-admin` (requires SuperAdmin token)
  - Body: `{ username, password, email }`
  - Returns: `{ id, username, dbName, email }`
  
- `GET /api/superadmin/admins` (requires SuperAdmin token)
  - Returns: Array of admin objects

- `DELETE /api/superadmin/admins/:id` (requires SuperAdmin token)
  - Returns: `{ success: true }`

Admin Endpoints
- `POST /api/admin/login`
  - Body: `{ username, password }` (credentials created via SuperAdmin)
  - Returns: `{ token, dbName }`
  
- `GET/POST/PUT/DELETE /api/admin/users[...]` (requires Admin token) - CRUD operations

Dynamic Databases
- MongoDB Atlas creates databases on first write; explicit provisioning is not required.
- We connect using the same cluster URI and pass a per-tenant `dbName` when creating a Mongoose connection.
- Optionally, to create Atlas database users per tenant, integrate Atlas Admin API (not included here).

Local Development
1) Backend
- `cd backend`
- Create `.env` file in the `backend` directory with all required variables (see Environment Variables section above).
- **IMPORTANT**: Ensure `SUPERADMIN_USER` and `SUPERADMIN_PASS` are set, otherwise you'll get "SuperAdmin not configured" error.
- `npm i`
- `npm run dev`

2) Frontend
- `cd frontend`
- Create `.env` file in the `frontend` directory with `VITE_API_URL=http://localhost:4000/api`.
- `npm i`
- `npm run dev`

Deployment Notes
- Backend: Render/Railway
  - Set environment variables.
  - Ensure CORS allows your Vercel domain.
- Frontend: Vercel
  - Set `VITE_API_URL` to your deployed backend `/api` URL.

Troubleshooting

Common Errors

1. "SuperAdmin not configured" (500 Error)
   - **Cause**: Missing `SUPERADMIN_USER` or `SUPERADMIN_PASS` environment variables in `backend/.env`
   - **Solution**: 
     - Ensure `backend/.env` file exists in the backend directory
     - Add both `SUPERADMIN_USER=<username>` and `SUPERADMIN_PASS=<password>` to the `.env` file
     - Restart the backend server after updating `.env`
     - Verify the `.env` file is in the correct location (`backend/.env`, not root `.env`)
   - **Test**: Try `POST /api/superadmin/login` with the credentials you set in `.env`

2. "MONGO_URI is not configured"
   - **Cause**: Missing `MONGO_URI` in `backend/.env`
   - **Solution**: Add `MONGO_URI=<your-mongodb-atlas-connection-string>` to `backend/.env`

3. CORS Errors
   - **Cause**: Frontend URL not allowed in `CORS_ORIGIN`
   - **Solution**: Update `CORS_ORIGIN` in `backend/.env` to match your frontend URL (e.g., `http://localhost:5173`)

Security Considerations
- Always hash passwords with bcrypt.
- Rotate `JWT_SECRET` and prefer short token TTLs.
- Consider HTTP-only cookies for tokens in production.
- If enabling Atlas per-tenant database users, restrict permissions to each tenant database.
- Never commit `.env` files to version control - use `.env.example` for templates.

Extending
- Add more tenant collections by extending `TenantModels` and controllers.
- Add email notifications on admin creation using a provider (e.g., SendGrid) in `createAdmin`.
- Add themes on the frontend with CSS variables or a UI library.

