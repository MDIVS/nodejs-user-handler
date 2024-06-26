[back to devlopment process](./../DEVELOPMENT_PROCESS.md)

# Postgres
For handling prosgres database, we are using [Sequelize](https://sequelize.org/) module.

In addition to `Sequelize` we are gonna need the `pg` and `pg-hstore` wich are drivers for Postgres:
```
npm i sequelize pg pg-hstore
```

# Connection
For enviroment variables in your `config/.env` file, create those variables replacing the values for the desired ones:
```
DB_USER=yourusername
DB_PASS=yourpassword
DB_HOST=localhost
DB_NAME=main_database
DB_PORT=5432
```

For db connection algorithm, create the file `src/db/postgres.js` and follow the [Getting Started](https://sequelize.org/docs/v6/getting-started/) tutorial using the `process.env.DB_` variables to ensure the use of enviroment data in connection.