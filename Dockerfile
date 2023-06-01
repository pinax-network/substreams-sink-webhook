FROM node:current

EXPOSE 8000

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

ENTRYPOINT ["node", "dist/bin/cli.js"]
