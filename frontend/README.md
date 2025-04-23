# Project Management Application

A comprehensive web-based project management and productivity tool built with React, TypeScript, and Vite.

![Project Management Dashboard](public/dashboard-preview.png)

## Features

- **Project Management**: Create and track projects with customizable statuses
- **Task Tracking**: Manage tasks with due dates, priorities, and assignees
- **Notes & Documentation**: Keep project-related notes organized
- **Calendar & Events**: Schedule and track project-related events
- **Reminders**: Set up notifications and reminders for important deadlines
- **File Attachments**: Upload and manage project files

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later) or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Detailed Documentation

For more detailed documentation, see the [DOCUMENTATION.md](./DOCUMENTATION.md) file.

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React Hooks, Context API, Redux
- **Styling**: CSS with variables
- **API Integration**: Custom hooks for data fetching

## Project Structure

The project follows a feature-based structure with reusable components:

- `components/`: Reusable UI components (modals, sidebar, etc.)
- `screens/`: Main application screens/pages
- `services/`: API integration and services
- `hooks/`: Custom React hooks
- `redux/`: Redux state management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
