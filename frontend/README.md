# Project Management Application

A full-stack application for managing projects, tasks, notes, events, reminders, and files.

## Features

- Project management with status tracking
- Task management with priority and assignment
- Notes organization by project and category
- Event scheduling
- Reminder system
- File uploads and management
- Responsive design for desktop and mobile

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: FastAPI (Python)
- **Styling**: CSS with responsive design

## Setup Instructions

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```
   
   The API will be available at http://localhost:8000/api
   
   API documentation will be available at http://localhost:8000/docs

## Project Structure

```
project-root/
├── public/            # Static files
├── src/
│   ├── components/    # Reusable UI components
│   ├── screens/       # Main application screens
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   └── App.tsx        # Main application component
├── backend/
│   ├── main.py        # FastAPI application
│   ├── requirements.txt # Python dependencies
│   └── data/          # Data storage (created at runtime)
└── package.json       # Frontend dependencies
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{project_id}` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/{project_id}` - Update project
- `DELETE /api/projects/{project_id}` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/projects/{project_id}/tasks` - Get tasks for a project
- `GET /api/tasks/{task_id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/projects/{project_id}/notes` - Get notes for a project
- `GET /api/notes/{note_id}` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/{note_id}` - Update note
- `DELETE /api/notes/{note_id}` - Delete note

### Events
- `GET /api/events` - Get all events
- `GET /api/projects/{project_id}/events` - Get events for a project
- `GET /api/events/{event_id}` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/{event_id}` - Update event
- `DELETE /api/events/{event_id}` - Delete event

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/projects/{project_id}/reminders` - Get reminders for a project
- `GET /api/reminders/{reminder_id}` - Get reminder by ID
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/{reminder_id}` - Update reminder
- `DELETE /api/reminders/{reminder_id}` - Delete reminder

### Files
- `GET /api/files` - Get all files
- `GET /api/projects/{project_id}/files` - Get files for a project
- `GET /api/files/{file_id}` - Get file by ID
- `POST /api/files` - Create new file (multipart/form-data)
- `DELETE /api/files/{file_id}` - Delete file

# Environment Variables in Vite

This project uses Vite as the build tool, which handles environment variables differently than Create React App.

## Available Environment Files

- `.env`: Default environment variables loaded in all environments
- `.env.development`: Variables loaded during development (when running `npm run dev`)
- `.env.production`: Variables loaded during production build (when running `npm run build`)

## Using Environment Variables

In Vite, you must prefix environment variables with `VITE_` for them to be exposed to your application.

Examples:
```
VITE_API_URL=http://localhost:8000
VITE_AUTH_DOMAIN=example.auth.com
```

## Accessing Environment Variables in Code

To access environment variables in your code, use `import.meta.env` instead of `process.env`:

```typescript
// ✅ Correct way in Vite
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Incorrect (this will cause "process is not defined" errors)
const apiUrl = process.env.REACT_APP_API_URL;
```

## Local Development

For local development:
1. Create a `.env.development.local` file in the root of the project (this file will be ignored by Git)
2. Add your local environment variables there

Example `.env.development.local`:
```
VITE_API_URL=http://localhost:8000
VITE_DEBUG=true
```

For more information, see the [Vite documentation on environment variables](https://vitejs.dev/guide/env-and-mode.html).
