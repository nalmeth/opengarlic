FROM node:current-alpine

# Add necessary stuff for using canvas in node
RUN apk add --update --no-cache \
curl \
make \
g++ \
jpeg-dev \
cairo-dev \
giflib-dev \
pango-dev \
libtool \
autoconf \
automake

RUN wget $(curl -S https://api.github.com/repos/ImageOptim/gifski/releases/latest | grep 'browser_download_url.*xz' | cut -d'"' -f4) -O /tmp/gifski.tar.xz && \
tar -xvf /tmp/gifski.tar.xz --strip-components=1 linux/gifski -C /tmp && \
mv /tmp/gifski /usr/local/bin && \
chown root:root /usr/local/bin/gifski && \
mkdir /root/.fonts

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json /app
RUN npm ci

COPY ./server.js /app
COPY .env /app
COPY ./modules /app/modules
COPY ./fonts /root/.fonts

CMD ["npm", "run", "start"]