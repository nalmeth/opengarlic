#!/bin/sh

if [[ ! -f /var/www/certbot ]]; then
	mkdir -p /var/www/certbot
fi

certbot certonly \
	--agree-tos \
	--domains "$LE_DOMAIN" \
	--email "$LE_EMAIL" \
	--no-eff-email \
	--noninteractive \
	--keep-until-expiring \
	--webroot \
	--webroot-path /var/www/certbot \
	$LE_OPTIONS || true

if [[ -f "/etc/letsencrypt/live/$LE_DOMAIN/privkey.pem" ]]; then
	cp "/etc/letsencrypt/live/$LE_DOMAIN/privkey.pem" /usr/share/nginx/certificates/privkey.pem
	cp "/etc/letsencrypt/live/$LE_DOMAIN/fullchain.pem" /usr/share/nginx/certificates/fullchain.pem
	cp "/etc/letsencrypt/live/$LE_DOMAIN/chain.pem" /usr/share/nginx/certificates/chain.pem
fi