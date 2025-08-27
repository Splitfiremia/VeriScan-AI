# VeriScan AI

## Overview

VeriScan AI is a full-stack web application for people search and verification services. The application provides advanced search capabilities through name, phone number, and address lookups, with user authentication and feature flagging capabilities. Built as a modern React application with an Express.js backend, it utilizes PostgreSQL for data persistence and includes comprehensive UI components for an intuitive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React with TypeScript** and follows a component-based architecture:
- **UI Framework**: Utilizes shadcn/ui components built on Radix UI primitives for consistent design
- **Styling**: Tailwind CSS for utility-first styling with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The application features a modular component structure with reusable UI components, search interfaces, and modal dialogs for detailed profile views.

### Backend Architecture
The backend follows a **REST API architecture** using Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Authentication with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL session store
- **Middleware**: Custom logging, error handling, and authentication middleware

The API provides endpoints for user management, search operations, feature flags, and profile data retrieval.

### Database Design
Uses **PostgreSQL** as the primary database with the following schema design:
- **Users Table**: Stores user profiles with authentication data (required for Replit Auth)
- **Sessions Table**: Handles session persistence (required for Replit Auth)
- **Search History**: Tracks user search queries and results
- **People Profiles**: Contains searchable people data with contact information
- **Feature Flags**: Supports A/B testing and gradual feature rollouts

### Authentication System
Implements **Replit Authentication** as the primary authentication mechanism:
- OAuth 2.0 / OpenID Connect flow for secure authentication
- Session-based authentication with encrypted cookies
- User profile management with automatic user creation/updates
- Middleware-based route protection

### Development Environment
- **Monorepo Structure**: Client and server code in separate directories with shared schema
- **Development Server**: Vite dev server with HMR for frontend, tsx for backend development
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Path Aliases**: Configured for clean imports and better code organization

## External Dependencies

### Core Framework Dependencies
- **React & TypeScript**: Frontend framework with type safety
- **Express.js**: Backend web framework
- **Vite**: Build tool and development server

### Database & ORM
- **PostgreSQL**: Primary database (configured for Neon Database)
- **Drizzle ORM**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection

### Authentication
- **Replit Authentication**: OAuth 2.0 / OIDC authentication system
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect client implementation
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Components & Styling
- **Radix UI**: Headless UI component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### State Management & API
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Development Tools
- **TypeScript**: Type checking and development experience
- **ESBuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development