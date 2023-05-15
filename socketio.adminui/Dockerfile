FROM node:current-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Copy in package json files
COPY package*.json /app

# Install node modules, and curl
RUN npm ci && apk update && apk add curl

# Download latest socket.io admin ui release and extract it for copying into final container
RUN wget $(curl -S https://api.github.com/repos/socketio/socket.io-admin-ui/releases/latest | grep 'tarball_url' | cut -d'"' -f4) -O /tmp/admin-ui.tar.gz && \
	mkdir -p /app/admin && \
	tar -xvf /tmp/admin-ui.tar.gz --strip-components=1 -C /tmp && \
	cp -r /tmp/ui/dist/* /app/admin

# Copy in the server script
COPY server.js /app

# Start the express server
CMD ["npm", "start"];