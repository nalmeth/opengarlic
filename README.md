# :paintbrush: OpenGarlic

# :question: QA

## What is this?

> This is a platform for social drawing games on a webpage.
> 
> The standard game mode is based on the children's game: Telephone.
> 
> However, different game modes can be developed to plugin.

## What's with the name?

> This project's name comes from two things. The common use of 'Open' in
> 
> open source software, particularly when a variation of another piece of software.
> 
> Garlic, because it's a malapropism of a similar game.

## Why?

> Development of this was partly a project to learn some new things.
> 
> The other part is, I find this game genuinely fun to play. I wanted to
> 
> open source the game for others to contribute and be able to run
> 
> their own servers.

## How can I contribute?

> Feel free to look through the issues and see if anything interests you.
> 
> You can also develop new game modes and share with others.
> 
> [Read the docs](docs/Development.md) on how to get started.

## How can I run the server?

> Read the [requirements](https://github.com/nalmeth/opengarlic#wrench-requirements).
> 
> Read the [Running Production](docs/Production.md) docs

---

# :toolbox: Tools

## :video_game: Client

- React: [https://reactjs.org/](https://reactjs.org/)
- Socket.io Client: [https://socket.io/](https://socket.io/)
- Material UI: [https://mui.com/](https://mui.com/)
- Konvajs: [https://konvajs.org/](https://konvajs.org/)
- FontAwesome: [https://fontawesome.com/](https://fontawesome.com/)
- Roboto Font: [https://fontsource.org/fonts/roboto](https://fontsource.org/fonts/roboto)

---

## :artificial_satellite: Server

- Node: [https://nodejs.org/en/](https://nodejs.org/en/)
- Socket.io Server: [https://socket.io/](https://socket.io/)
- Socket.io Admin UI: [https://github.com/socketio/socket.io-admin-ui/](https://github.com/socketio/socket.io-admin-ui/)
- Express: [https://expressjs.com/](https://expressjs.com/)
- Redis Server [https://redis.io/](https://redis.io/)
- RedisJSON module [https://redis.io/docs/stack/json/](https://redis.io/docs/stack/json/)
- Redis Client: [https://www.npmjs.com/package/redis](https://www.npmjs.com/package/redis)

---

# :wrench: Requirements

- Redis server with the RedisJSON module.
  
  *Ready-made docker image available via docker-compose.yml*

- Computer with the ability to run docker containers, if you decide to use docker.

---

# :sparkles: Features

|                    | Production            | Development          |
| ------------------ | --------------------- | -------------------- |
| SSL                | :white_check_mark:    | :white_check_mark:\* |
| Socket.IO Admin UI | :white_check_mark:\** | :white_check_mark:** |
| RedisInsight       | :x:                   | :white_check_mark:   |
| Hot Reload         | :x:                   | :white_check_mark:   |

<sub>\* [Generating localhost certificates](docs/Development.md#lock-ssl-support)</sub>

<sub>\*\* :warning: Interface is not currently secured. This will eventually be fixed. Suggestion is not to run it in production without self-securing.</sub>
