# :ship: :whale: Running Production :factory:

- Docker: [https://www.docker.com/](https://www.docker.com/)
- Nginx: [nginx](https://nginx.org/en/)
- Let's Encrypt [https://letsencrypt.org/](https://letsencrypt.org/)

---

# :arrow_forward: How To Start

```
1. Copy the .env.docker-example and rename to .env
2. Set .env variables as needed
```

### :lock: Production SSL Support

Configure the following in .env

- LE_DOMAIN=example.com
- LE_EMAIL=email@example.com
- (Optional) LE_OPTIONS (Extra certbot switches. ex. --staging)
- (Optional) RENEW_INTERVAL (Any valid *sleep* values. Default: 12h)

*Automatic Registration and renewal of certificates is provided using certbot by Let's Encrypt.*

---

### :hammer_and_wrench: :package: Build and start

```
docker compose build
docker compose up -d
```

## ## :electric_plug: Socket Admin

Socket.io Websocket Admin UI is available.

:warning: At the moment, this interface is not secured! Securing it is on the agenda :warning:

```
http://example.com/admin

Enter 'http://example.com/admin' as the Server URL
```

---

## :mag_right: RedisInsight

RedisInsight is available when using development containers

```
http://example.com:8001 /
```
