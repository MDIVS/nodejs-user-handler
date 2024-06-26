[back to devlopment process](./DEVELOPMENT_PROCESS.md)

# Create a hapi server
Hapi is a powerful and flexible Node. js framework for building web applications and APIs.

First, npm install hapi:
```
npm i @hapi/hapi
```

Setup a server port in your enviroment file:
```
PORT=5000
```

Then create your hapi server:
```
const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
```