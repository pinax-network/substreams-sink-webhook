FROM node:current

EXPOSE 8000

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

ENTRYPOINT ["node", "dist/bin/cli.js"]