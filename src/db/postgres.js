const Sequelize = require('sequelize');

class Postgres {
    static async connect() {
        const SSL_DB = process.env.SSL_DB === 'true' ? true : undefined;
        const SSL_DB_REJECT = process.env.SSL_DB_REJECT === 'false' ? false : undefined;
        
        let dialectOptions = {}
        if (SSL_DB) {
            dialectOptions = {
                ssl: {
                    require: SSL_DB,
                    rejectUnauthorized: SSL_DB_REJECT,
                }
            };
        };
        
        // DB_URL: DB_DIALECT://DB_USER:DB_PASS@DB_HOST:DB_PORT/DB_NAME
        // EXAMPLE: postgres://jhon:12345@localhost:5432/datalake
        const connection = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASS,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                quoteIdentifiers: false,
                logging: false,
                dialect: 'postgres',
                dialectOptions
            }
        );

        try {
            await connection.authenticate();
            console.log('✅ Postgres database connection has been established successfully.');
        } catch (error) {
            throw Error(`Unable to connect to the database: ${error}`);
        }

        return connection;
    };
}

module.exports = Postgres