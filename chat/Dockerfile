FROM node:22

RUN curl https://dl.min.io/client/mc/release/linux-amd64/mc \
  --create-dirs \
  -o $HOME/minio-binaries/mc

RUN chmod +x $HOME/minio-binaries/mc

RUN cp ~/minio-binaries/mc /usr/local/bin/

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY . .

EXPOSE 3000-3010

CMD [ "npm", "run" , "dev" ]
