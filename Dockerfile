FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN apt update
RUN apt full-upgrade --yes
RUN apt install --yes mongodb
#ENTRYPOINT service mongodb start
RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node","app.js" ]
ENTRYPOINT service mongodb start
