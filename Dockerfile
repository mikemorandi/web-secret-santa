# Stage 1: Install dependencies
FROM node:current-alpine AS deps

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build Frontend
FROM node:current-alpine AS frontend-build

RUN npm install -g pnpm

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json

# Copy frontend source
COPY apps/frontend/ ./apps/frontend/

# Build frontend
WORKDIR /app/apps/frontend
RUN pnpm run build

# Stage 3: Build Backend
FROM node:current-alpine AS backend-build

RUN npm install -g pnpm

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json

# Copy backend source
COPY apps/backend/ ./apps/backend/

# Build backend
WORKDIR /app/apps/backend
RUN pnpm run build

# Stage 4: Production
FROM node:current-alpine AS production

WORKDIR /app/apps/backend

# Copy backend build artifacts
COPY --from=backend-build /app/apps/backend/dist ./dist
COPY --from=backend-build /app/apps/backend/package*.json ./
COPY --from=backend-build /app/apps/backend/src/modules/mail/templates ./dist/modules/mail/templates

# Copy node_modules with pnpm workspace structure
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/backend/node_modules ./node_modules

# Copy frontend build to public directory (served by backend)
COPY --from=frontend-build /app/apps/frontend/dist ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
