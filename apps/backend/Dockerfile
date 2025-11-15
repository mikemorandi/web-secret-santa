FROM node:current-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:current-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/src/modules/mail/templates ./dist/modules/mail/templates

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]