ARG NODE_IMAGE=public.ecr.aws/docker/library/node:22-alpine
FROM ${NODE_IMAGE}
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/math-engine/package.json packages/math-engine/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY apps/web apps/web
COPY packages/types packages/types
COPY packages/math-engine packages/math-engine
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]
