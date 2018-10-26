FROM node:10

WORKDIR /dfotose

# Bundle app source
COPY . .

# Install all dependencies
RUN npm install
RUN npm install -g gulp pm2

# Set the locale
RUN apt-get update
RUN apt-get install -y locales locales-all
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install python (for data recovery script)
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
RUN pip3 install pymongo

# Build the app
RUN gulp server:build
RUN gulp config:copy
RUN gulp client:copy
RUN gulp client:build

RUN sh setup-kerberos.sh

EXPOSE 4000
