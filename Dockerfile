FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN npm install
RUN npm install mongodb -g

COPY . .

EXPOSE 4000

RUN node app.js
