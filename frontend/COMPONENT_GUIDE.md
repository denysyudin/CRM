# Component Guide

This document provides an overview of the main components used in the application, explaining their purpose, props, and usage patterns.

## Table of Contents

- [Modal Components](#modal-components)
  - [ProjectModal](#projectmodal)
  - [TaskModal](#taskmodal)
  - [NoteModal](#notemodal)
  - [EventModal](#eventmodal)
  - [ReminderModal](#remindermodal)
- [Screens](#screens)
  - [Projects](#projects)
  - [Dashboard](#dashboard)
  - [Notes](#notes)
  - [Calendar](#calendar)
  - [TaskDashboard](#taskdashboard)
  - [Reminders](#reminders)
  - [Employee](#employee)
- [Utility Components](#utility-components)
  - [Sidebar](#sidebar)
  - [LinkedItemsList](#linkeditemslist)
  - [LoadingState](#loadingstate)
  - [ErrorState](#errorstate)

## Modal Components

### ProjectModal

**Purpose**: Create or edit project details.

**Props**:
```typescript
interface ProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, 'id'> & { uploadedFile?: globalThis.File }) => void;
  project?: Project;
}
```

**Usage**:
```jsx
<ProjectModal 
  onClose={() => setShowAddProjectModal(false)}
  onSubmit={handleProjectSubmit}
  project={editingProject} // Optional: provide when editing existing project
/>
```

### TaskModal

**Purpose**: Create or edit task details.

**Props**:
```typescript
interface TaskModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id'>) => void;
  task?: Task;
}
```

**Usage**:
```jsx
<TaskModal 
  projectName={selectedProject.name}
  onClose={() => setShowAddTaskModal(false)}
  onSubmit={handleTaskSubmit}
  task={editingTask} // Optional: provide when editing existing task
/>
```

### NoteModal

**Purpose**: Create or edit notes.

**Props**:
```typescript
interface NoteModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (noteData: Omit<Note, 'id'>) => void;
  note?: Note;
}
```

**Usage**:
```jsx
<NoteModal 
  projectName={selectedProject.name}
  onClose={() => setShowAddNoteModal(false)}
  onSubmit={handleNoteSubmit}
  note={editingNote} // Optional: provide when editing existing note
/>
```

### EventModal

**Purpose**: Create or edit events.

**Props**:
```typescript
interface EventModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (eventData: Omit<Event, 'id'>) => void;
  event?: Event;
}
```

**Usage**:
```jsx
<EventModal 
  projectName={selectedProject.name}
  onClose={() => setShowAddEventModal(false)}
  onSubmit={handleEventSubmit}
  event={editingEvent} // Optional: provide when editing existing event
/>
```

### ReminderModal

**Purpose**: Create or edit reminders.

**Props**:
```typescript
interface ReminderModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (reminderData: Omit<Reminder, 'id'>) => void;
  reminder?: Reminder;
}
```

**Usage**:
```jsx
<ReminderModal 
  projectName={selectedProject.name}
  onClose={() => setShowAddReminderModal(false)}
  onSubmit={handleReminderSubmit}
  reminder={editingReminder} // Optional: provide when editing existing reminder
/>
```

## Screens

### Projects

**Purpose**: Main screen for managing projects and their related items.

**Key Features**:
- List of projects with status indicators
- Project details view showing description and metadata
- Related tasks, notes, events, reminders, and files
- Ability to add new related items

**States**:
- Loading state while fetching data
- Error state when API calls fail
- Empty state when no projects are available

### Dashboard

**Purpose**: Provides an overview of all activities across projects.

**Key Features**:
- Recent activity summary
- Upcoming deadlines and events
- Tasks due soon
- Key metrics and statistics

### Notes

**Purpose**: Dedicated screen for managing and viewing notes.

**Key Features**:
- List of notes with filtering options
- Note creation and editing
- Note categorization
- Search functionality

### Calendar

**Purpose**: Calendar view for managing events and deadlines.

**Key Features**:
- Month/week/day views
- Event creation directly from calendar
- Filters for event types
- Visual indicators for different event types

### TaskDashboard

**Purpose**: Kanban-style task management.

**Key Features**:
- Task board with columns for different statuses
- Drag-and-drop task movement
- Task filtering and sorting
- Task creation and editing

### Reminders

**Purpose**: Manage reminders and notifications.

**Key Features**:
- List of reminders with priority indicators
- Create and edit reminders
- Set reminder times and recurrence
- Mark reminders as complete

### Employee

**Purpose**: Manage employee information and assignments.

**Key Features**:
- Employee profiles
- Task assignments
- Performance tracking
- Project allocation

## Utility Components

### Sidebar

**Purpose**: Navigation component for the application.

**Props**:
```typescript
interface SidebarProps {
  // May have props for active route, etc.
}
```

**Usage**:
```jsx
<Sidebar />
```

### LinkedItemsList

**Purpose**: Displays lists of linked items (tasks, notes, etc.) in a consistent format.

**Props**:
```typescript
interface LinkedItemsListProps {
  items: string[]; 
  itemsData: Record<string, any>;
  formatter: (item: any) => React.ReactNode;
  emptyMessage?: string;
}
```

**Usage**:
```jsx
<LinkedItemsList
  items={project.tasks}
  itemsData={tasksDict}
  formatter={formatTask}
  emptyMessage="No tasks found for this project."
/>
```

### LoadingState

**Purpose**: Consistent loading indicator for async operations.

**Props**: None

**Usage**:
```jsx
{isLoading && <LoadingState />}
```

### ErrorState

**Purpose**: Consistent error display with retry capability.

**Props**:
```typescript
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}
```

**Usage**:
```jsx
{error && <ErrorState message={error.message} onRetry={refetchData} />}
```

## Styling Approach

Components use a combination of:

1. **CSS Variables**: For theming and consistent colors
2. **Component-specific CSS**: For component layout and unique styles
3. **Responsive Design**: Components adapt to different screen sizes

### CSS Example:

```css
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1010;
}

.modal-content {
    background-color: #fff;
    padding: 30px 35px;
    border-radius: 12px;
    max-width: 550px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    transform-origin: center;
    animation: modalFadeIn 0.3s ease-out;
}
``` 