FROM node:21

WORKDIR /dfotose

# Install all dependencies
COPY package.json .
RUN npm install
RUN npm install -g gulp pm2

# Bundle app source
COPY . .

# Build the app
RUN gulp server:build
RUN gulp config:copy
RUN gulp client:copy
RUN gulp client:build

RUN sh setup-kerberos.sh
