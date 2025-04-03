# Secret Santa (Wichtel) Backend - NestJS Version

The application facilitates a Secret Santa gift exchange by managing participants, their participation status, and randomly assigning gift recipients.

## Features

- User participation management
- Random assignment of gift recipients
- Support for exclusion constraints (who cannot be assigned to whom)
- Support for pre-assignments (fixed assignments)
- Email notifications for participation updates and assignments

## Technology Stack

- NestJS - A progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- TypeScript - Typed superset of JavaScript
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling for Node.js
- Nodemailer - Email sending capability
- Pug - Template engine for HTML emails
- Swagger/OpenAPI - API documentation

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in a `.env` file (see .env.example)

3. Run the development server:
   ```
   npm run start:dev
   ```

4. For production:
   ```
   npm run build
   npm run start:prod
   ```

5. Or use Docker:
   ```
   docker build -t secret-santa-backend .
   docker run -p 3000:3000 --env-file .env secret-santa-backend
   ```

## Database Setup

The application uses MongoDB. Make sure to set the correct connection string in the .env file. For a new installation, the application will create the following collections:

- users
- assignments
- pre_assignments
- settings

## Testing

```
npm run test
npm run test:e2e
```