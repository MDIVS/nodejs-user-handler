if (!process.env.ENV_NAME) throw new Error('No enviroment detected, check if you are running the application using "npm run" command.');
console.log(`Node Js User Handler (${process.env.ENV_NAME})`);

const Postgres = require('./src/db/postgres');
const init_schema_user = require('./src/db/schemas/user');

const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Swagger = require('hapi-swagger');
const RouteUser = require('./src/routes/user');

async function main() {
    let connection = await Postgres.connect();
    init_schema_user(connection);
    connection.sync();

    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost',
        routes: {cors: true}
    });

    server.route(
        [
            ...new RouteUser(connection).routes
        ]
    );

    const swaggerOptions = {
        documentationPath: '/',
        info: {
            title: `Node Js User Handler (${process.env.ENV_NAME})`,
            version: require('./package.json').version,
            description: 'Open source backend for handling user sign in and sign out with Node js and PostgreSQL.',
            contact: {
                name: 'MDIVS',
                email: 'maiconoficialbr@gmail.com',
                url: 'https://github.com/MDIVS/nodejs-user-handler'
            }
        }
    };

    await server.register([
        Vision,
        Inert,
        {
            plugin: Swagger,
            options: swaggerOptions
        }
    ]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

module.exports = main();