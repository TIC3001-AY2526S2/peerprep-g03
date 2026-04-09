FROM node:24

WORKDIR /usr/src/app/matchingService/server

COPY matchingService/server/package*.json ./
COPY packages/auth /usr/src/app/packages/auth

RUN cd /usr/src/app/packages/auth && npm install
RUN npm install

COPY matchingService/server ./

EXPOSE 5051

CMD ["npm", "run", "dev"]
