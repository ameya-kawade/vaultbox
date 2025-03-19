FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY . .

EXPOSE 3000-3010

CMD [ "npm", "run" , "dev" ]