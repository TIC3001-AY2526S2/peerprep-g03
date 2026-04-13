FROM node:24

WORKDIR /usr/src/app/collaborationService/server

COPY collaborationService/server/package*.json ./
COPY packages/auth /usr/src/app/packages/auth

RUN cd /usr/src/app/packages/auth && npm install
RUN npm install

COPY collaborationService/server ./

EXPOSE 5052

CMD ["npm", "run", "dev"]
