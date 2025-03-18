const { Sequelize, Model } = require('sequelize');

class UserAuthProviders extends Model {}

/**
 * @description Initializes object schema
 * @param {Sequelize} connection - Sequelize connection
 */
function init(connection) {
    UserAuthProviders.init(
        {
            id: {
                type: Sequelize.INTEGER,
                required: true,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
                deferrable: Sequelize.Deferrable.SET_DEFERRED // Prevents updates from conflicting with themselves by postponing the duplication check until the end of the operation.
            },
            user_id: {
                type: Sequelize.INTEGER,
                foreignKey: true,
                required: true
            },
            provider: {
                type: Sequelize.STRING,
                required: true,
            },
            provider_user_id: {
                type: Sequelize.STRING,
                required: true,
            },
            issued_at: {
                type: Sequelize.DATE
            },
            expires_at: {
                type: Sequelize.DATE
            }
        },
        {
            sequelize: connection,
            modelName: 'UserAuthProvider',
            tableName: 'user_auth_providers',
            freezeTableName: false
        },
    );
};

module.exports = init;