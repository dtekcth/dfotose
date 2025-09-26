FROM node:18

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
RUN npm install

# Install global tools
RUN npm install -g gulp@4 pm2

# If you want bull only locally, move to dependencies in package.json.
# Otherwise installing separately is fine:
RUN npm install bull

# Bundle app source
COPY . .

# Build the app
RUN npx gulp server:build
RUN npx gulp config:copy
RUN npx gulp client:copy
RUN npx gulp client:build

RUN sh setup-kerberos.sh

# Use PM2 to run clustered processes
CMD ["pm2-runtime", "start", "-i", "10", "dist/server.js"]
