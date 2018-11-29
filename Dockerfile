FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN apt update
RUN apt install --yes mongodb
CMD service mongodb start
RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node","app.js" ]
