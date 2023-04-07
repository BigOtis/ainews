FROM node:lts

WORKDIR /app
RUN chmod g+rwx /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY . /app
RUN npm run build

CMD ["node", "server.js"] 