FROM node:21 as builder
WORKDIR /app

COPY package*.json .
COPY ./packages/client/package*.json ./packages/client/

RUN npm install
RUN npm run build -w client

FROM node:21

WORKDIR /app

COPY ./config/krb5.conf /etc/krb5.conf

# Install all dependencies
COPY package*.json .
COPY ./packages/server/package*.json ./packages/server/
RUN npm install

# Bundle app source
COPY ./packages/server ./packages/server
COPY --from=builder /app/packages/client/build ./packages/server/public

CMD npm start -w server
