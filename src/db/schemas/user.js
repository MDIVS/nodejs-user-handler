const { Sequelize, Model } = require('sequelize');

class User extends Model {}

/**
 * @description Initializes object schema
 * @param {Sequelize} connection - Sequelize connection
 */
function init(connection) {
    User.init(
        {
            id: {
                type: Sequelize.INTEGER,
                required: true,
                primaryKey: true,
                autoIncrement: true
            },

            username: {type: Sequelize.STRING, unique: true, required: true},
            password: {type: Sequelize.STRING, required: true}
        },
        {
            sequelize: connection,
            modelName: 'User',
            tableName: 'users'
        },
    );
};

module.exports = init;