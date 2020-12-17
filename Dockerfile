FROM node:latest

WORKDIR /app

COPY package*.json /app/

RUN npm install -g @vue/cli

RUN npm install

CMD ["npm", "run", "serve"]