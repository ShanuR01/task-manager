# Task Manager

A full-stack Task Manager built with NestJS (backend) and Next.js (frontend).

## Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later (comes with Node 20)

Verify with:

```bash
node -v
npm -v
```

## Project Structure

```
task-manager/
├── api/   # NestJS REST API
└── web/   # Next.js frontend
```

## 1. Backend (NestJS API)

### Install dependencies

```bash
cd api
npm install
```

### Environment variables

No `.env` file is required. The API runs on port **3000** by default. To use a different port set the `PORT` environment variable before starting:

```bash
# Windows
set PORT=3001

# macOS / Linux
export PORT=3001
```

### Start the backend

```bash
# from the /api folder
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Available endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /tasks | List all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PATCH | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

> **Note:** Data is stored in memory. Restarting the server clears all tasks.

---

## 2. Frontend (Next.js)

### Install dependencies

```bash
cd web
npm install
```

### Environment variables

No `.env` file is required. The frontend expects the API at `http://localhost:3000`. If you changed the API port, update `API_URL` in `web/lib/api.ts`.

### Start the frontend

```bash
# from the /web folder
npm run dev
```

The app will be available at `http://localhost:3001` (Next.js picks the next free port automatically if 3000 is taken by the API).

---

## Running both together

Open two terminals:

**Terminal 1 — API:**
```bash
cd api
npm install
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd web
npm install
npm run dev
```

Then open `http://localhost:3001` in your browser.

---

## ## How I Used AI

I used **ChatGPT** as an AI-assisted development tool throughout this assignment.

I used it to:

- Understand the NestJS project structure and REST API implementation.
- Get guidance on creating controllers, services, DTOs and input validation.
- Understand Next.js App Router and frontend-backend integration.
- Troubleshoot TypeScript errors and runtime issues.
- Implement and refine the task creation, editing and deletion workflows.
- Understand API testing and improve the application.

I reviewed, implemented, tested and adjusted the generated code throughout development. I also used the AI assistance to understand the technical decisions rather than relying on generated code without understanding it.
