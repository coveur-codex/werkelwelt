ARG NODE_IMAGE=public.ecr.aws/docker/library/node:22-alpine
FROM ${NODE_IMAGE}
WORKDIR /app
COPY package*.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY apps/worker apps/worker
COPY packages/types packages/types
WORKDIR /app/apps/worker
CMD ["npm", "run", "dev"]
