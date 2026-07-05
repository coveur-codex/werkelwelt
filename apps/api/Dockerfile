ARG NODE_IMAGE=public.ecr.aws/docker/library/node:22-alpine
FROM ${NODE_IMAGE}
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/types packages/types
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npm", "run", "dev"]
