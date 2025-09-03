FROM node:10

WORKDIR /dfotose

# Install all dependencies
COPY package.json .
RUN npm install
RUN npm install -g gulp pm2
RUN npm install bull

# Bundle app source
COPY . .

# Build the app
RUN gulp server:build
RUN gulp config:copy
RUN gulp client:copy
RUN gulp client:build

RUN sh setup-kerberos.sh

FROM node:10

WORKDIR /dfotose

COPY package.json .
RUN npm install
RUN npm install -g gulp pm2


COPY . .

RUN gulp server:build
RUN gulp config:copy
RUN gulp client:copy
RUN gulp client:build



# Add this line - the missing command!
CMD ["node", "dist/server.js"]
