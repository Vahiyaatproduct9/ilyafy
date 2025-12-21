FROM node:24-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      wget \
      ffmpeg \
      ca-certificates \
      python3 \
      python3-pip \
    && update-ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

# ---- Set working directory ----
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY . .
COPY prisma ./prisma/

RUN npx prisma generate

EXPOSE 8080
# RUN tree

CMD ["node", "dist/main"]
