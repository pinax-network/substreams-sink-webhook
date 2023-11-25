FROM node:alpine

EXPOSE 9102

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENTRYPOINT ["npm", "start"]