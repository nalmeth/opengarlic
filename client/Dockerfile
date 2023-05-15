############
# Stage 1
############
FROM node:current-alpine as builder

# Add curl for later RUN command
RUN apk update && apk add curl

# Setup working directory and add node modules bin to PATH
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Copy in package json files and install dependencies
COPY package*.json /app
RUN npm ci
# --loglevel verbose

# Copy in the rest of the application
COPY . /app

# Pull these build args in, then reassign into env vars for npm build
# Hack because these don't work just injected from .env file
ARG REACT_APP_SOCKET_SERVER
ENV REACT_APP_SOCKET_SERVER ${REACT_APP_SOCKET_SERVER}

RUN npm run build

############
# Stage 2
############

# Setup nginx, copy in built files, open 80 and start
FROM nginx:stable-alpine

# Copy built application files into web root
COPY --from=builder /app/build /usr/share/nginx/html

# Copy in the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Add scripts
COPY docker-entrypoint.sh docker-entrypoint.sh
COPY cert/certbot.sh certbot.sh

# Add additional cert files - these should get replaced when certbot runs
COPY cert/chain.pem /usr/share/nginx/certificates/chain.pem
COPY cert/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem

ARG LE_DOMAIN

RUN apk update && \
	# Add needed tools
	apk add inotify-tools certbot openssl && \
	# Add execute permission to scripts
	chmod +x docker-entrypoint.sh && \
	chmod +x certbot.sh && \
	# Replace the dummy server_name in nginx conf with the configured domain
	sed -i "s/LE_DOMAIN/$LE_DOMAIN/g" /etc/nginx/nginx.conf

ENTRYPOINT ["./docker-entrypoint.sh"]