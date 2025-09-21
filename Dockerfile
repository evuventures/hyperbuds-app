FROM node:20

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]