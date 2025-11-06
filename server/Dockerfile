# ---- Base image ----
# ---- Base image ----
FROM node:20-slim

# ---- Replace resolv.conf safely ----
RUN cp /etc/resolv.conf /tmp/resolv.conf && \
    echo "nameserver 8.8.8.8" > /tmp/resolv.conf && \
    echo "nameserver 1.1.1.1" >> /tmp/resolv.conf && \
    mv /tmp/resolv.conf /etc/resolv.conf || true

# ---- Install dependencies ----
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

# ---- Install yt-dlp ----
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

# ---- Set working directory ----
WORKDIR /app

# ---- Copy and install Node dependencies ----
COPY package*.json ./
RUN npm install --production

# ---- Copy app source ----
COPY . .

# ---- Expose port for Render ----
EXPOSE 8080

# ---- Default command ----
CMD ["npm", "run", "start"]
