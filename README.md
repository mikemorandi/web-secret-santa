# Web Secret Santa (Wichtel)

A web application that facilitates organizing Secret Santa (Wichtel) gift exchanges. Participants can register, set preferences, and automatically get assigned to someone for gift-giving. The system handles notifications, exclusion rules, and pre-assignments.

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

```
web-secret-santa/
├── backend/            # NestJS backend application
│   └── ...
├── frontend/           # Vue.js frontend application
│   └── ...
└── docker-compose.yml  # Docker Compose configuration
```

## Setup and Deployment

1. Clone the repository
2. Configure environment variables in:
   - `frontend/.env.development` and `frontend/.env.production`
   - Backend environment variables via Docker Compose

3. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

4. Or run each component separately:
   - Frontend: `cd frontend && npm install && npm run serve`
   - Backend: `cd backend && npm install && npm run start:dev`
   - MongoDB: Run locally or via Docker
