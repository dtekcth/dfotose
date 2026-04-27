FROM node:24-bookworm-slim

WORKDIR /dfotose

# Avoid prompts when installing krb5-user
ENV DEBIAN_FRONTEND=noninteractive

# For kerberos
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libkrb5-dev \
    krb5-user \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# PM2 is used for the existing clustered production runtime.
RUN npm install -g pm2@6

# Bundle app source
COPY . .

# Build the app
RUN npm run build

RUN sh setup-kerberos.sh

ENV NODE_ENV=production

# Use PM2 to run clustered processes
CMD ["pm2-runtime", "start", "-i", "10", "dist/server.js"]
