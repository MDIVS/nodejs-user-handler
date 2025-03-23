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
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
                deferrable: Sequelize.Deferrable.SET_DEFERRED // Prevents updates from conflicting with themselves by postponing the duplication check until the end of the operation.
            },
            user_id: {
                type: Sequelize.INTEGER,
                foreignKey: true,
                allowNull: false,
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            provider_user_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
        },
        {
            sequelize: connection,
            modelName: 'UserAuthProvider',
            tableName: 'user_auth_providers',
            freezeTableName: false,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};

module.exports = init;