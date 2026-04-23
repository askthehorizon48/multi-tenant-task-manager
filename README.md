# Multi-Tenant Task Manager (RBAC)

A full-stack, multi-tenant task management system built to demonstrate strict data isolation and Role-Based Access Control (RBAC). Designed as a scalable Software-as-a-Service (SaaS) architecture, this application ensures that organizations can manage their own tasks securely without data leakage.

**Demo Video:** [Insert Your Demo Video Link Here]

---

## 🚀 Tech Stack

**Frontend:**
* React (scaffolded with Vite)
* Tailwind CSS (Styling)
* Axios (API Client)
* React Router DOM

**Backend:**
* Node.js & Express.js
* PostgreSQL (Relational Database)
* Prisma (ORM)
* JSON Web Tokens (JWT) for Authentication

**Infrastructure:**
* Docker & Docker Compose

---

## ✨ Core Features

* **Strict Multi-Tenancy (Data Isolation):** Every user and task is bound to an `organizationId`. Backend queries are strictly scoped using middleware to guarantee data isolation between tenants.
* **Role-Based Access Control (RBAC):**
  * `ADMIN`: Can view, update, and delete all tasks within their organization.
  * `MEMBER`: Can view all organization tasks, but can only update or delete tasks they explicitly created.
* **Audit Logging:** All task creation and update events are automatically logged to a `TaskAudit` table for historical tracking and compliance.
* **Containerized Environment:** Fully dockerized PostgreSQL setup for consistent local development.

---

## 🛠️ How to Run Locally

### Prerequisites
* Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop) is installed and running on your machine.
* Ensure [Node.js](https://nodejs.org/) (v16+) is installed.

### 1. Database Setup (Docker)
First, spin up the local PostgreSQL database using Docker Compose. From the root directory, run:
```bash
docker compose up -d
```
### 2. Backend Setup
Open a new terminal window, navigate to the `backend` directory, and run the following commands:
```bash
cd backend
npm install

# Push the Prisma schema to the Docker database
npx prisma db push

# Start the Express server (runs on port 3000)
npm start
```

### 3. Frontend Setup
Open another terminal window, navigate to the `frontend` directory, and start the Vite development server:
```bash
cd frontend
npm install

# Start the React app
npm run dev
```
The application will now be available at `http://localhost:5173`.

---

## 🔐 API Documentation Overview

### Authentication `/auth`
* `POST /auth/register`: Registers a new user. 
  * *Note on flow:* If `organizationName` is provided, it creates a new Organization and assigns the user the `ADMIN` role. If `organizationId` is provided, it adds the user to that existing organization as a `MEMBER`.
* `POST /auth/login`: Authenticates a user and issues a JWT containing `userId`, `role`, and `organizationId`.

### Tasks `/tasks` (Protected Routes)
*All routes require a valid JWT `Authorization: Bearer <token>` header.*
* `GET /tasks`: Returns all tasks scoped strictly to the authenticated user's `organizationId`.
* `POST /tasks`: Creates a new task and logs the 'CREATED' action to the audit table.
* `PUT /tasks/:id`: Updates a task (restricted by RBAC) and logs the 'UPDATED' action.
* `DELETE /tasks/:id`: Deletes a task (restricted by RBAC).
