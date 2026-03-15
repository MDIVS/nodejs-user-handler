if (!process.env.ENV_NAME) throw new Error('No enviroment detected, check if you are running the application using "npm run" command.');
console.log(`⭐ Node Js User Handler (${process.env.ENV_NAME})`);

import './src/db/initializer.js';

import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import Pack from './package.json' with { type: 'json' };

import routes from './src/routes/index.js';

async function main() {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost',
        routes: {
            cors: {
                origin: [
                    'http://localhost:'+process.env.PORT,
                    process.env.FRONTEND_ORIGIN
                ],
                credentials: true
            }
        }
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

    server.state('session', {
        ttl: 3600000,
        isSecure: true,
        isHttpOnly: true,
        isSameSite: 'Lax'
    });

    server.route(
        [
            ...routes,
            {
                method: 'GET',
                path: '/test',
                options: {
                    tags: ['api']
                },
                handler: (request, h) => {
                    return 'Hello World!';
                }
            }
        ]
    );

    await server.start();
    console.log('🎯 Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

export default main();