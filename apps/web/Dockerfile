FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY apps/web apps/web
COPY packages/types packages/types
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]
