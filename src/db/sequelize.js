import Sequelize from 'sequelize';

const SSL_DB = process.env.SSL_DB === 'true' ? true : undefined;
const SSL_DB_REJECT = process.env.SSL_DB_REJECT === 'false' ? false : undefined;
const DIALECT_OPTIONS = SSL_DB ? {
    ssl: {
        require: SSL_DB,
        rejectUnauthorized: SSL_DB_REJECT,
    }
} : {};

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        quoteIdentifiers: false,
        logging: false,
        dialect: 'postgres',
        DIALECT_OPTIONS
    }
);

export default sequelize;