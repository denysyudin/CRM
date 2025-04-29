# Project Structure Documentation

This document outlines the organization of the React frontend codebase.

## Directory Structure

```
frontend/
├── src/
│   ├── assets/               # Static assets (images, icons, fonts)
│   ├── components/           # Reusable components
│   │   ├── common/           # Truly reusable components across the app
│   │   │   ├── Button.tsx    # Reusable button component
│   │   │   └── index.ts      # Re-exports all common components
│   │   ├── forms/            # Form components (TaskModal, ProjectModal, etc)
│   │   │   ├── TaskModal.tsx # Task form component
│   │   │   └── index.ts      # Re-exports all form components
│   │   ├── layout/           # Layout components (Sidebar, Header)
│   │   │   ├── Sidebar.tsx   # Main sidebar navigation
│   │   │   └── index.ts      # Re-exports all layout components
│   │   └── index.ts          # Re-exports from all component categories
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API and other services
│   │   ├── api/              # API modules by entity
│   │   │   ├── index.ts      # Re-exports all APIs
│   │   │   ├── config.ts     # Base API configuration
│   │   │   ├── projectsApi.ts
│   │   │   ├── tasksApi.ts
│   │   │   └── ...
│   ├── types/                # TypeScript interfaces/types
│   │   ├── index.ts          # Re-exports all types
│   │   ├── project.types.ts
│   │   ├── task.types.ts
│   │   └── ...
│   ├── screens/              # Page components
│   ├── utils/                # Utility functions
│   │   ├── dateUtils.ts      # Date formatting utilities
│   ├── store/                # State management (Redux)
│   ├── styles/               # Global styles
│   └── routes/               # Route definitions
```

## Key Conventions

### Imports

Use consistent import ordering:

1. React and libraries
2. Types
3. Components
4. Hooks
5. Utils
6. Styles

Example:

```typescript
import React, { useState } from 'react';
import { Task, Project } from '../../types';
import { Button } from '../../components/common';
import { Sidebar } from '../../components/layout';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateUtils';
import './styles.css';
```

### Typing

- All component props should have interfaces
- Use consistent naming pattern for type files: `entity.types.ts`
- Export all types from `types/index.ts` for simplified imports

### API Services

- Each entity has its own API service file
- Each API service exports CRUD operations
- Re-export all API services from a single index file

## Implementation Progress

- [x] Basic folder structure 
- [x] Type definitions
- [x] API service modularization
- [x] Component reorganization
  - [x] Basic organization structure (common, forms, layout)
  - [x] Button component (common)
  - [x] TaskModal component (forms)
  - [x] Sidebar component (layout)
  - [x] Index files for exports
- [x] Import updates (started)
- [x] Added utility functions (dateUtils)
- [ ] Complete import updates
- [ ] Style reorganization

## Migration Guide

When moving a component:

1. Create the file in the new location with updated imports
2. Update all imports in other files that reference this component
3. Remove the old file

Always test the application after moving each component to ensure functionality is maintained. 