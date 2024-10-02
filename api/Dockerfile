FROM node:22-alpine3.20

WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec tsc

EXPOSE 3000

CMD ["node", "--env-file", ".env", "dist/src/server.js"]
