if (!process.env.ENV_NAME) throw new Error('No enviroment detected, check if you are running the application using "npm run" command.');
console.log(`⭐ Node Js User Handler (${process.env.ENV_NAME})`);

const sequelize = require('./src/db/postgres');
const init_schema_user = require('./src/db/schemas/user');
const init_schema_user_auth_provider = require('./src/db/schemas/user-auth-provider');

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const RouteUser = require('./src/routes/user');
const AuthRoutes = require('./src/routes/auth');

async function main() {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize database connection has been established successfully.');
    } catch (error) {
        throw Error(`Unable to connect to the database: ${error}`);
    }

    init_schema_user(sequelize);
    init_schema_user_auth_provider(sequelize);
    sequelize.sync();

    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost',
        routes: { cors: { origin: ["*"] } }
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'API Documentation',
                    version: Pack.version,
                },
                documentationPath: '/'
            }
        }
    ]);

    server.route(
        [
            {
                method: 'GET',
                path: '/test',
                options: {
                    tags: ['api']
                },
                handler: (request, h) => {
                    return 'Hello World!';
                }
            },
            ...new RouteUser(sequelize).routes,
            ...new AuthRoutes(sequelize).routes
        ]
    );

    await server.start();
    console.log('🎯 Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

module.exports = main();