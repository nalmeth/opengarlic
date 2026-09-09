############
# Stage 1
############
FROM node:current-alpine as builder

# Setup working directory and add node modules bin to PATH
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Workspace manifests first, for better layer caching. The shared
# constants package is a real workspace dependency of the client
# (resolved via a local symlink, not the npm registry) - it has to be
# present in this same install, so this image now builds from the
# repo root context instead of ./client alone.
COPY package*.json /app/
COPY client/package.json /app/client/package.json
COPY packages/shared/package.json /app/packages/shared/package.json

RUN npm ci --workspace=client --workspace=packages/shared

# Copy in the rest of the application
COPY client /app/client
COPY packages/shared /app/packages/shared

# Pull these build args in, then reassign into env vars for npm build
# Hack because these don't work just injected from .env file
ARG REACT_APP_SOCKET_SERVER
ENV REACT_APP_SOCKET_SERVER ${REACT_APP_SOCKET_SERVER}

RUN npm run build -w client

############
# Stage 2
############

# Setup nginx, copy in built files, open 80 and start
FROM nginx:stable-alpine

# Copy built application files into web root
COPY --from=builder /app/client/build /usr/share/nginx/html

# Copy in the nginx configuration file
COPY client/nginx.conf /etc/nginx/nginx.conf

# Add scripts
COPY client/docker-entrypoint.sh docker-entrypoint.sh
COPY client/cert/certbot.sh certbot.sh

# Add additional cert files - these should get replaced when certbot runs
COPY client/cert/chain.pem /usr/share/nginx/certificates/chain.pem
COPY client/cert/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem

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
