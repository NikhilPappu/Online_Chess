FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN apt install mongodb
RUN npm install

COPY . .

EXPOSE 4000

RUN node app.js
