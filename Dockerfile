FROM node:current-alpine

ARG user=node
USER $user

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json /app
RUN npm ci
#--loglevel verbose

COPY --chown=$user:$user ./server.js /app
COPY --chown=$user:$user .env /app
COPY --chown=$user:$user ./modules /app/modules

CMD ["npm", "run", "start"]