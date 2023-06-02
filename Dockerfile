FROM node:current

EXPOSE 9102

ENV PRIVATE_KEY=PVT_K1_...
ENV PUBLIC_KEY=PUB_K1_...
ENV SUBSTREAMS_API_TOKEN=...
ENV URL=http://host.docker.internal:3000
ENV CHAIN=wax
ENV SPKG=eosio.token
ENV MODULE=map_transfers

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

ENTRYPOINT ["node", "dist/bin/cli.js"]
