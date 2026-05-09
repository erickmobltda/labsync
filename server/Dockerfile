FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Install tsx for running TypeScript directly
RUN npm install --save-dev tsx

VOLUME ["/data"]

ENV NODE_ENV=production
ENV DB_PATH=/data/labsync.db
ENV UPLOADS_DIR=/data/uploads
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
