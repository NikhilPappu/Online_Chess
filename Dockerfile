FROM node:8

WORKDIR ~/Online-Chess

COPY package*.json ./

RUN apt update
RUN apt full-upgrade --yes
RUN apt install --yes mongodb
CMD /etc/init.d/mongod start
RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node","app.js" ]
