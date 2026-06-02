FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS server-dev
WORKDIR /app
COPY . .
EXPOSE 8787
CMD ["npm", "run", "server:dev"]

FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM base AS preview
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD ["npm", "run", "preview"]
