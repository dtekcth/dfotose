FROM node:21


WORKDIR /app

COPY ./config/krb5.conf /etc/krb5.conf

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
