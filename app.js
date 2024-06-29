if (!process.env.ENV_NAME) throw new Error('No enviroment detected, check if you are running the application using "npm run" command.');
console.log(`Node Js User Handler (${process.env.ENV_NAME})`);

const Postgres = require('./src/db/postgres');
const init_schema_user = require('./src/db/schemas/user');

const Hapi = require('@hapi/hapi');

async function main() {
    let connection = await Postgres.connect();
    init_schema_user(connection);
    connection.sync();

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

module.exports = main();