# Overview

AttendanceTracker Pro is a professional employee attendance tracking system built with React and Express. The application provides real-time clock-in/clock-out functionality for employees and a comprehensive HR dashboard for monitoring work hours and productivity. The system features a modern, responsive UI with automated status tracking (late arrivals), visual analytics, and comprehensive reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

The application structure separates concerns with dedicated directories for components, pages, hooks, and utilities. The UI components are modular and reusable, following the compound component pattern from Radix UI primitives.

## Backend Architecture
The backend uses Express.js with TypeScript in a RESTful API design:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for HTTP server and middleware
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend
- **Storage**: In-memory storage implementation with interface for future database integration

The server follows a modular architecture with separate files for routes, storage abstraction, and Vite integration for development. API endpoints handle attendance operations (clock-in, clock-out, filtering, statistics) with proper error handling and logging.

## Data Storage Solutions
Currently implements an in-memory storage system with a well-defined interface:

- **Storage Interface**: Abstract IStorage interface defining all data operations
- **Current Implementation**: MemStorage class using JavaScript Maps
- **Database Ready**: Drizzle configuration for PostgreSQL with Neon Database
- **Schema Management**: Centralized schema definitions in shared directory
- **Migration Support**: Drizzle Kit configured for database migrations

The storage layer is designed for easy migration to PostgreSQL when scaling requirements demand persistent storage.

## Authentication and Authorization
The system implements a simple password-based authentication for HR dashboard access:

- **HR Access**: Password protection for administrative features
- **Session Management**: Frontend state-based authentication status
- **Employee Access**: Open access for clock-in/clock-out functionality
- **Security**: Environment-based configuration for sensitive data

## Key Features and Business Logic
- **Smart Status Detection**: Automatic late marking for arrivals after 9:15 AM
- **Duplicate Prevention**: Prevents multiple clock-ins for the same employee on the same day
- **Real-time Clock**: Live time display with automatic updates
- **Comprehensive Filtering**: Employee name, department, date, and minimum hours filtering
- **Statistics Dashboard**: Real-time metrics including total employees, active status, late arrivals, and average hours
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Visual Feedback**: Toast notifications and loading states for better UX

# External Dependencies

## Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL for production deployment (configured)
- **Database URL**: Environment variable configuration for connection string

## UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled React components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Modern icon library with consistent design
- **Class Variance Authority**: Utility for creating variant-based component APIs

## Development and Build Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Replit Integration**: Development environment optimization with error overlays

## Form and Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## State Management and HTTP
- **TanStack React Query**: Server state management with caching and synchronization
- **Wouter**: Minimalist routing library for React applications

## Fonts and Assets
- **Google Fonts**: Inter font family for modern typography
- **Unsplash/Pixabay**: Stock photography for visual enhancement (development)