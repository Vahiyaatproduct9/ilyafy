FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ffmpeg \
    ca-certificates \
    python3 && \
    update-ca-certificates \
    rm -rf /var/lib/apt/lists/*

RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  && chmod +x yt-dlp \
  && mv yt-dlp /usr/local/bin/

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
