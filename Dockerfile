FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD["npm","start"]
