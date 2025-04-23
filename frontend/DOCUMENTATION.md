# Frontend Documentation

## Project Overview

This project is a web-based productivity and project management application built with React, TypeScript, and Vite. The application allows users to manage projects, tasks, notes, events, reminders, and files in an integrated environment.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Main Features](#main-features)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Build and Deployment](#build-and-deployment)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later) or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### Running the Application

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` (or the port configured in your Vite setup).

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ProjectModal.tsx
│   │   ├── TaskModal.tsx
│   │   ├── NoteModal.tsx
│   │   ├── EventModal.tsx
│   │   ├── ReminderModal.tsx
│   │   ├── Sidebar/
│   │   │   └── Sidebar.tsx
│   │   └── ...
│   ├── screens/          # Main application screens/pages
│   │   ├── Dashboard/
│   │   ├── Projects/
│   │   ├── Notes/
│   │   ├── Calendar/
│   │   ├── TaskDashboard/
│   │   ├── Reminders/
│   │   ├── Employee/
│   │   └── ...
│   ├── services/         # API and service integrations
│   │   └── api.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useApi.ts
│   ├── redux/            # Redux state management
│   │   ├── features/
│   │   └── store.ts
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── package.json          # Project dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Main Features

The application includes the following main features:

- **Projects Management**: Create, view, edit, and manage projects
- **Task Management**: Assign and track tasks with due dates and priorities
- **Notes**: Create and organize notes related to projects
- **Calendar Events**: Schedule and manage events with date and time
- **Reminders**: Set reminders with different priority levels
- **File Attachments**: Upload and manage files associated with projects

## Components

### Modal Components

The application uses modals for creating and editing different types of content:

- `ProjectModal`: For creating/editing projects
- `TaskModal`: For creating/editing tasks
- `NoteModal`: For creating/editing notes
- `EventModal`: For creating/editing events
- `ReminderModal`: For creating/editing reminders

### Screen Components

Each main feature has its dedicated screen component:

- `Projects`: Displays projects and their related tasks, notes, events, etc.
- `Dashboard`: Provides an overview of all activities
- `Calendar`: Calendar view with event scheduling
- `TaskDashboard`: Focused view for task management
- `Notes`: For managing and viewing notes
- `Reminders`: For managing reminders

### Utility Components

- `Sidebar`: Navigation sidebar for the application
- `LinkedItemsList`: Displays lists of related items (tasks, notes, etc.)
- `LoadingState`: Displays loading indicators
- `ErrorState`: Handles and displays error states

## State Management

The application uses a combination of:

- React's built-in state management (useState, useEffect)
- Custom hooks (useApi)
- Redux for global state management (for features like reminders)

## API Integration

API calls are handled through the `services/api.ts` file, which defines interfaces for different data types (Project, Task, Note, Event, Reminder, File) and provides methods for CRUD operations.

The `useApi` hook is used for data fetching with loading and error handling.

## Styling

The application uses CSS modules for styling, with separate stylesheets for each component/screen:

- Global styles define variables for consistent theming
- Component-specific styles are in corresponding `.css` files
- Responsive design is implemented for mobile and tablet views

Key style features:
- Modal styling with animations
- Responsive layouts
- Status indicators with color coding
- Loading and error state styling

## Build and Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with optimized production assets.

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

For deployment, upload the contents of the `dist` directory to your hosting provider or use a CI/CD pipeline for automated deployments. 