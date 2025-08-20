# Overview

SmartPaper AI is a comprehensive educational platform that manages paper generation, student submissions, and grading across different user roles. The system serves administrators, teachers, and students with role-specific dashboards and functionality. It provides an interface for creating and managing educational content, submitting assignments, and tracking academic progress.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture. The UI is constructed using shadcn/ui components with Radix UI primitives for accessibility and Tailwind CSS for styling. The application employs Wouter for client-side routing and TanStack Query for server state management. Context providers handle authentication state and theming across the application.

The frontend follows a role-based design pattern with distinct layouts and dashboards for administrators, teachers, and students. Each role has its own set of components and pages, ensuring appropriate access control and user experience tailored to their needs.

## Backend Architecture
The server is built with Express.js and follows a RESTful API design. The backend implements a layered architecture with clear separation between routing logic and data storage operations. Routes are organized in a centralized registration system, handling authentication, user management, and CRUD operations for educational entities.

The storage layer uses an interface-based design pattern (IStorage) to abstract data operations, making the system flexible for different database implementations. This design enables easy testing and potential database switching without affecting the business logic.

## Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes entities for users, classes, papers, submissions, grades, and study materials, with proper foreign key relationships maintaining data integrity.

Database migrations are managed through Drizzle Kit, and the schema is shared between client and server through a shared TypeScript module, ensuring type consistency across the full stack.

## Authentication & Authorization
Authentication is implemented using a simple username/password system with session-based storage. User roles (admin, teacher, student) determine access levels and available functionality. The authentication context provides login/logout functionality and maintains user state across the application.

Role-based access control is enforced both at the frontend routing level and backend API endpoints, ensuring users can only access appropriate resources and functionality.

## State Management
Client-side state is managed through a combination of React Context for global state (authentication, theming) and TanStack Query for server state management. This approach provides efficient caching, background updates, and optimistic updates for a smooth user experience.

The query client is configured with custom error handling and request/response interceptors for consistent API communication patterns.

# External Dependencies

## Database & ORM
- **PostgreSQL**: Primary database using the `postgresql` dialect
- **Drizzle ORM**: Type-safe database operations with `drizzle-orm` and `drizzle-kit`
- **Neon Database**: Serverless PostgreSQL connection via `@neondatabase/serverless`

## UI & Styling
- **Radix UI**: Comprehensive set of UI primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Frontend Framework & Routing
- **React**: Component-based UI library with TypeScript support
- **Wouter**: Minimalist routing library for React
- **Vite**: Build tool and development server

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation library

## Development & Build Tools
- **TypeScript**: Type safety across the full stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing and optimization
- **Various React hooks and utilities**: Enhanced development experience

The application is configured for deployment on Replit with specific optimizations for the platform's environment and development workflow.