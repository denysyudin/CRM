# Backend API Documentation

## Overview

This document outlines the RESTful API endpoints available in the backend service. The API provides functionality for managing projects, tasks, notes, events, reminders, and files.

## Base URL

```
http://localhost:8000
```

## Authentication

Authentication is handled via JWT tokens. Include the token in the Authorization header of your requests:

```
Authorization: Bearer <token>
```

## API Endpoints

### Projects

#### Get All Projects

Retrieves a list of all projects.

- **URL**: `/projects`
- **Method**: `GET`
- **Query Parameters**:
  - `status` (optional): Filter projects by status

**Response**:
```json
[
  {
    "id": "proj-123",
    "name": "Project Phoenix",
    "description": "Website redesign project",
    "status": "In Progress",
    "startDate": "2023-06-15",
    "endDate": "2023-12-31",
    "icon": "📱",
    "tasks": ["task-1", "task-2"],
    "notes": ["note-1"],
    "events": ["event-1"],
    "reminders": ["reminder-1"],
    "files": ["file-1"]
  },
  // more projects...
]
```

#### Get Project by ID

Retrieves a specific project by ID.

- **URL**: `/projects/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Project ID

**Response**:
```json
{
  "id": "proj-123",
  "name": "Project Phoenix",
  "description": "Website redesign project",
  "status": "In Progress",
  "startDate": "2023-06-15",
  "endDate": "2023-12-31",
  "icon": "📱",
  "tasks": ["task-1", "task-2"],
  "notes": ["note-1"],
  "events": ["event-1"],
  "reminders": ["reminder-1"],
  "files": ["file-1"]
}
```

#### Create Project

Creates a new project.

- **URL**: `/projects`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "Not Started",
  "startDate": "2023-07-01",
  "endDate": "2023-12-31",
  "icon": "🚀"
}
```

**Response**:
```json
{
  "id": "proj-456",
  "name": "New Project",
  "description": "Project description",
  "status": "Not Started",
  "startDate": "2023-07-01",
  "endDate": "2023-12-31",
  "icon": "🚀",
  "tasks": [],
  "notes": [],
  "events": [],
  "reminders": [],
  "files": []
}
```

#### Update Project

Updates an existing project.

- **URL**: `/projects/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Project ID
- **Body**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "In Progress"
}
```

**Response**:
```json
{
  "id": "proj-123",
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "In Progress",
  "startDate": "2023-06-15",
  "endDate": "2023-12-31",
  "icon": "📱",
  "tasks": ["task-1", "task-2"],
  "notes": ["note-1"],
  "events": ["event-1"],
  "reminders": ["reminder-1"],
  "files": ["file-1"]
}
```

#### Delete Project

Deletes a project.

- **URL**: `/projects/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Project ID

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Tasks

#### Get All Tasks

Retrieves all tasks, optionally filtered by project.

- **URL**: `/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `projectId` (optional): Filter tasks by project

**Response**:
```json
[
  {
    "id": "task-1",
    "name": "Design homepage mockup",
    "description": "Create mockups for the new homepage design",
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2023-07-15",
    "assignee": "user-123",
    "projectId": "proj-123"
  },
  // more tasks...
]
```

#### Get Project Tasks

Retrieves tasks for a specific project.

- **URL**: `/projects/:projectId/tasks`
- **Method**: `GET`
- **URL Parameters**:
  - `projectId`: Project ID

**Response**:
```json
[
  {
    "id": "task-1",
    "name": "Design homepage mockup",
    "description": "Create mockups for the new homepage design",
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2023-07-15",
    "assignee": "user-123",
    "projectId": "proj-123"
  },
  // more tasks...
]
```

#### Get Task by ID

Retrieves a specific task.

- **URL**: `/tasks/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Task ID

**Response**:
```json
{
  "id": "task-1",
  "name": "Design homepage mockup",
  "description": "Create mockups for the new homepage design",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2023-07-15",
  "assignee": "user-123",
  "projectId": "proj-123"
}
```

#### Create Task

Creates a new task.

- **URL**: `/tasks`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "New Task",
  "description": "Task description",
  "status": "To Do",
  "priority": "Medium",
  "dueDate": "2023-08-01",
  "assignee": "user-456",
  "projectId": "proj-123"
}
```

**Response**:
```json
{
  "id": "task-3",
  "name": "New Task",
  "description": "Task description",
  "status": "To Do",
  "priority": "Medium",
  "dueDate": "2023-08-01",
  "assignee": "user-456",
  "projectId": "proj-123"
}
```

#### Update Task

Updates an existing task.

- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Task ID
- **Body**:
```json
{
  "status": "Done",
  "description": "Updated description"
}
```

**Response**:
```json
{
  "id": "task-1",
  "name": "Design homepage mockup",
  "description": "Updated description",
  "status": "Done",
  "priority": "High",
  "dueDate": "2023-07-15",
  "assignee": "user-123",
  "projectId": "proj-123"
}
```

#### Delete Task

Deletes a task.

- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Task ID

**Response**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Notes

#### Get All Notes

Retrieves all notes, optionally filtered by project.

- **URL**: `/notes`
- **Method**: `GET`
- **Query Parameters**:
  - `project` (optional): Filter notes by project

**Response**:
```json
[
  {
    "id": "note-1",
    "title": "Meeting Notes",
    "content": "Discussed project timeline and deliverables",
    "date": "2023-06-20",
    "category": "Meeting",
    "project": "proj-123"
  },
  // more notes...
]
```

#### Get Project Notes

Retrieves notes for a specific project.

- **URL**: `/projects/:projectId/notes`
- **Method**: `GET`
- **URL Parameters**:
  - `projectId`: Project ID

**Response**:
```json
[
  {
    "id": "note-1",
    "title": "Meeting Notes",
    "content": "Discussed project timeline and deliverables",
    "date": "2023-06-20",
    "category": "Meeting",
    "project": "proj-123"
  },
  // more notes...
]
```

#### Get Note by ID

Retrieves a specific note.

- **URL**: `/notes/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Note ID

**Response**:
```json
{
  "id": "note-1",
  "title": "Meeting Notes",
  "content": "Discussed project timeline and deliverables",
  "date": "2023-06-20",
  "category": "Meeting",
  "project": "proj-123"
}
```

#### Create Note

Creates a new note.

- **URL**: `/notes`
- **Method**: `POST`
- **Body**:
```json
{
  "title": "New Note",
  "content": "Note content here",
  "date": "2023-07-05",
  "category": "General",
  "project": "proj-123"
}
```

**Response**:
```json
{
  "id": "note-2",
  "title": "New Note",
  "content": "Note content here",
  "date": "2023-07-05",
  "category": "General",
  "project": "proj-123"
}
```

#### Update Note

Updates an existing note.

- **URL**: `/notes/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Note ID
- **Body**:
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response**:
```json
{
  "id": "note-1",
  "title": "Updated Title",
  "content": "Updated content",
  "date": "2023-06-20",
  "category": "Meeting",
  "project": "proj-123"
}
```

#### Delete Note

Deletes a note.

- **URL**: `/notes/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Note ID

**Response**:
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### Events

#### Get All Events

Retrieves all events, optionally filtered by project.

- **URL**: `/events`
- **Method**: `GET`
- **Query Parameters**:
  - `projectId` (optional): Filter events by project

**Response**:
```json
[
  {
    "id": "event-1",
    "name": "Client Meeting",
    "date": "2023-07-15",
    "type": "meeting",
    "participants": "John, Sarah, Client Team",
    "notes": "Discuss project progress",
    "projectId": "proj-123"
  },
  // more events...
]
```

#### Get Project Events

Retrieves events for a specific project.

- **URL**: `/projects/:projectId/events`
- **Method**: `GET`
- **URL Parameters**:
  - `projectId`: Project ID

**Response**:
```json
[
  {
    "id": "event-1",
    "name": "Client Meeting",
    "date": "2023-07-15",
    "type": "meeting",
    "participants": "John, Sarah, Client Team",
    "notes": "Discuss project progress",
    "projectId": "proj-123"
  },
  // more events...
]
```

#### Get Event by ID

Retrieves a specific event.

- **URL**: `/events/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Event ID

**Response**:
```json
{
  "id": "event-1",
  "name": "Client Meeting",
  "date": "2023-07-15",
  "type": "meeting",
  "participants": "John, Sarah, Client Team",
  "notes": "Discuss project progress",
  "projectId": "proj-123"
}
```

#### Create Event

Creates a new event.

- **URL**: `/events`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "New Event",
  "date": "2023-08-10",
  "type": "deadline",
  "participants": "",
  "notes": "Project deadline",
  "projectId": "proj-123"
}
```

**Response**:
```json
{
  "id": "event-2",
  "name": "New Event",
  "date": "2023-08-10",
  "type": "deadline",
  "participants": "",
  "notes": "Project deadline",
  "projectId": "proj-123"
}
```

#### Update Event

Updates an existing event.

- **URL**: `/events/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Event ID
- **Body**:
```json
{
  "date": "2023-07-20",
  "participants": "John, Sarah, Mike, Client Team"
}
```

**Response**:
```json
{
  "id": "event-1",
  "name": "Client Meeting",
  "date": "2023-07-20",
  "type": "meeting",
  "participants": "John, Sarah, Mike, Client Team",
  "notes": "Discuss project progress",
  "projectId": "proj-123"
}
```

#### Delete Event

Deletes an event.

- **URL**: `/events/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Event ID

**Response**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Reminders

#### Get All Reminders

Retrieves all reminders, optionally filtered by project.

- **URL**: `/reminders`
- **Method**: `GET`
- **Query Parameters**:
  - `projectId` (optional): Filter reminders by project

**Response**:
```json
[
  {
    "id": "reminder-1",
    "name": "Submit Design Mockups",
    "dueDate": "2023-07-14",
    "priority": "High",
    "projectId": "proj-123"
  },
  // more reminders...
]
```

#### Get Project Reminders

Retrieves reminders for a specific project.

- **URL**: `/projects/:projectId/reminders`
- **Method**: `GET`
- **URL Parameters**:
  - `projectId`: Project ID

**Response**:
```json
[
  {
    "id": "reminder-1",
    "name": "Submit Design Mockups",
    "dueDate": "2023-07-14",
    "priority": "High",
    "projectId": "proj-123"
  },
  // more reminders...
]
```

#### Get Reminder by ID

Retrieves a specific reminder.

- **URL**: `/reminders/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Reminder ID

**Response**:
```json
{
  "id": "reminder-1",
  "name": "Submit Design Mockups",
  "dueDate": "2023-07-14",
  "priority": "High",
  "projectId": "proj-123"
}
```

#### Create Reminder

Creates a new reminder.

- **URL**: `/reminders`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "Prepare for Client Demo",
  "dueDate": "2023-07-25",
  "priority": "Medium",
  "projectId": "proj-123"
}
```

**Response**:
```json
{
  "id": "reminder-2",
  "name": "Prepare for Client Demo",
  "dueDate": "2023-07-25",
  "priority": "Medium",
  "projectId": "proj-123"
}
```

#### Update Reminder

Updates an existing reminder.

- **URL**: `/reminders/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Reminder ID
- **Body**:
```json
{
  "dueDate": "2023-07-13",
  "priority": "Urgent"
}
```

**Response**:
```json
{
  "id": "reminder-1",
  "name": "Submit Design Mockups",
  "dueDate": "2023-07-13",
  "priority": "Urgent",
  "projectId": "proj-123"
}
```

#### Delete Reminder

Deletes a reminder.

- **URL**: `/reminders/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: Reminder ID

**Response**:
```json
{
  "success": true,
  "message": "Reminder deleted successfully"
}
```

### Files

#### Get All Files

Retrieves all files, optionally filtered by project.

- **URL**: `/files`
- **Method**: `GET`
- **Query Parameters**:
  - `projectId` (optional): Filter files by project

**Response**:
```json
[
  {
    "id": "file-1",
    "name": "homepage-mockup.jpg",
    "type": "image/jpeg",
    "projectId": "proj-123"
  },
  // more files...
]
```

#### Get Project Files

Retrieves files for a specific project.

- **URL**: `/projects/:projectId/files`
- **Method**: `GET`
- **URL Parameters**:
  - `projectId`: Project ID

**Response**:
```json
[
  {
    "id": "file-1",
    "name": "homepage-mockup.jpg",
    "type": "image/jpeg",
    "projectId": "proj-123"
  },
  // more files...
]
```

#### Get File by ID

Retrieves metadata for a specific file.

- **URL**: `/files/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: File ID

**Response**:
```json
{
  "id": "file-1",
  "name": "homepage-mockup.jpg",
  "type": "image/jpeg",
  "projectId": "proj-123"
}
```

#### Download File

Downloads a specific file.

- **URL**: `/files/:id/download`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: File ID

**Response**: The file content with appropriate Content-Type header.

#### Upload File

Uploads a new file.

- **URL**: `/files`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file`: The file to upload
  - `projectId`: ID of the project to associate the file with

**Response**:
```json
{
  "id": "file-2",
  "name": "requirements.pdf",
  "type": "application/pdf",
  "projectId": "proj-123"
}
```

#### Delete File

Deletes a file.

- **URL**: `/files/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: File ID

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Error Handling

The API returns appropriate HTTP status codes for different error conditions:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a message describing the error:

```json
{
  "error": true,
  "message": "Description of the error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per user

When rate limits are exceeded, the API returns a `429 Too Many Requests` status code with information about when to retry.

## Pagination

For endpoints that return lists of resources, pagination is supported using the following query parameters:

- `page`: Page number (starts from 1)
- `limit`: Number of items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "data": [
    // resources...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
``` 