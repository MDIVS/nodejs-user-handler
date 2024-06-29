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
                autoIncrement: true,
                unique: true,
                deferrable: Sequelize.Deferrable.SET_DEFERRED // Prevents updates from conflicting with themselves by postponing the duplication check until the end of the operation.
            },
    
            preferredname: {type: Sequelize.STRING},
            firstname: {type: Sequelize.STRING, required: true},
            middlename: {type: Sequelize.STRING},
            lastname: {type: Sequelize.STRING, required: true},
            fullname: {type: Sequelize.STRING, required: true},
            username: {type: Sequelize.STRING, primaryKey: true},
    
            // profile_id: {type: Sequelize.INTEGER, references: {model:'profiles', key:'id'}},
            // role_id: {type: Sequelize.INTEGER, references: {model:'roles', key:'id'}},
            email: {
                type: Sequelize.STRING,
                required: true,
                primaryKey: true,
                unique: true,
                deferrable: Sequelize.Deferrable.SET_DEFERRED
            },
            
            password: {type: Sequelize.STRING, required: true},
            phone: {type: Sequelize.STRING},
            last_ip: {type: Sequelize.STRING},
            keep_connected: {type: Sequelize.BOOLEAN},
            last_accepted_term_version: {type: Sequelize.STRING},
            created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
            updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
        },
        {
            sequelize: connection,
            modelName: 'User',
            tableName: 'users',
            freezeTableName: false,
            timestamps: false
        },
    );
};

module.exports = init;