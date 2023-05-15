#!/bin/sh

# Ensure folder exists
if [[ ! -d /usr/share/nginx/certificates ]]; then
	mkdir -p /usr/share/nginx/certificates
fi

# Create Dummy Certs
if [[ ! -f /usr/share/nginx/certificates/fullchain.pem ]]; then
	# https://letsencrypt.org/docs/certificates-for-localhost/
	openssl req -x509 -nodes -newkey rsa:4096 -sha256 -days 1 \
		-keyout /usr/share/nginx/certificates/privkey.pem \
		-out /usr/share/nginx/certificates/fullchain.pem \
		-subj '/CN=localhost' -extensions EXT -config <( \
			printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
fi

# Start certbot background process, and run every renew interval or 12hrs
$(while :; do /certbot.sh; sleep "${RENEW_INTERVAL:-12h}"; done;) &

# Watch for cert file changes. On change, reload nginx
$(while inotifywait -e close_write /usr/share/nginx/certificates; do nginx -s reload; done) &

# Start nginx
nginx -g "daemon off;"