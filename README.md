# Web Secret Santa

A web application that facilitates organizing Secret Santa gift exchanges. Participants can register, set preferences, and automatically get assigned to someone for gift-giving. The system handles notifications, exclusion rules, and pre-assignments.

## Features

- User registration and participation management
- Random assignment of gift recipients with constraints
- Support for exclusion rules (who cannot be assigned to whom)
- Support for pre-assignments (fixed assignments)
- Automatic email notifications
- Scheduled drawing execution
- Mobile-friendly web interface

## Tech Stack

### Frontend
- Vue.js 3 with TypeScript
- Bootstrap 5 for styling
- Vue Router for navigation
- Axios for HTTP requests
- Moment.js for date handling

### Backend
- NestJS - A progressive Node.js framework
- TypeScript - Typed JavaScript
- MongoDB - NoSQL database with Mongoose ODM
- Nodemailer - Email sending capability
- Pug - Template engine for HTML emails
- Swagger/OpenAPI - API documentation

### Infrastructure
- Docker containers for all components
- Docker Compose for local development and deployment

## Project Structure

This is a **pnpm monorepo** containing both frontend and backend applications:

```
web-secret-santa/
├── apps/
│   ├── backend/            # NestJS backend application
│   │   └── ...
│   └── frontend/           # Vue.js frontend application
│       └── ...
├── docker-compose.yml      # Docker Compose configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package.json with workspace scripts
```

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (Install with: `npm install -g pnpm`)

## Setup and Development

### Initial Setup

1. Clone the repository
2. Install dependencies for all packages:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   - `apps/frontend/.env.development` and `apps/frontend/.env.production`
   - Backend environment variables via Docker Compose

### Development

Run all applications in development mode:
```bash
pnpm dev
```

Or run individual applications:
```bash
# Backend only
pnpm backend:dev

# Frontend only
pnpm frontend:dev
```

### Building

Build all applications:
```bash
pnpm build
```

Or build individually:
```bash
# Backend
pnpm backend:build

# Frontend
pnpm frontend:build
```

### Testing & Linting

```bash
# Run tests across all packages
pnpm test

# Run linting across all packages
pnpm lint
```

## Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up -d
```

This will build both frontend and backend from the monorepo structure.
