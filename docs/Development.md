# :construction_worker: Development

# :arrow_forward: How To Start

```
1. Copy the .env.example and rename to .env
2. Set .env variables as needed
```

---

## :lock: SSL Support

To generate certs for localhost, run the openssl command below. Use the premade config.

**:warning: Make sure output is into client/cert directory using the given names. Or change the paths in client/.env :warning:**

```
openssl req -x509 -nodes -newkey rsa:4096 -sha256 -days 1 \
    -keyout client/cert/local.privkey.pem \
    -out client/cert/local.fullchain.pem \
    -subj '/CN=localhost' -extensions EXT -config client/cert/localcert.conf
```

---

## :satellite: Redis

Run the development redis server. (Includes RedisInsight)

```
Development
docker compose -f docker-devredis.yml up -d
```

## :arrow_forward: Start the server :artificial_satellite: and client :video_game:

```
npm run dev
```

## :mag_right: RedisInsight

RedisInsight is available while using the development redis server.

```
http://example.com:8001 /
```

# :keyboard: Writing Code

- [How to create a game mode](./Creating.Game.md)

- More to come...
