# --- STAGE 1: Build ---
  FROM node:22-slim AS builder
  
  WORKDIR /app
  
  # Install build dependencies for Prisma & general tools
  RUN apt-get update && apt-get install -y python3 make g++ openssl
  
  COPY package*.json ./
  COPY prisma ./prisma/
  
  # 1. Install ALL dependencies (including devDeps like Nest CLI)
  RUN npm install
  
  COPY . .
  
  ARG DATABASE_URL
  ENV DATABASE_URL=$DATABASE_URL
  
  # 2. Build the project (creates the /dist folder)
  RUN npx prisma generate
  RUN npm run build
  
  # --- STAGE 2: Production ---
  FROM node:22-slim AS runner
  
  # Install runtime dependencies (ffmpeg, yt-dlp, etc.)
  RUN apt-get update && \
      apt-get install -y --no-install-recommends \
        wget \
        ffmpeg \
        ca-certificates \
        python3 \
      && update-ca-certificates \
      && apt-get clean \
      && rm -rf /var/lib/apt/lists/*
  
  # Install yt-dlp
  RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
      chmod +x /usr/local/bin/yt-dlp
  
  WORKDIR /app
  
  # 3. Copy only production dependencies
  COPY package*.json ./
  RUN npm install --omit=dev
  
  # 4. Copy the compiled code from the builder stage
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
  
  # Environment setup
  ARG DATABASE_URL
  ENV DATABASE_URL=$DATABASE_URL
  ENV NODE_ENV=production
  
  EXPOSE 8080
  
  CMD ["node", "dist/main"]