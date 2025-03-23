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
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
                deferrable: Sequelize.Deferrable.SET_DEFERRED // Prevents updates from conflicting with themselves by postponing the duplication check until the end of the operation.
            },
    
            preferredname: {type: Sequelize.STRING},
            firstname: {type: Sequelize.STRING},
            middlename: {type: Sequelize.STRING},
            lastname: {type: Sequelize.STRING},
            fullname: {type: Sequelize.STRING},
            username: {type: Sequelize.STRING, allowNull: false, unique: true, deferrable: Sequelize.Deferrable.SET_DEFERRED},
    
            // profile_id: {type: Sequelize.INTEGER, references: {model:'profiles', key:'id'}},
            // role_id: {type: Sequelize.INTEGER, references: {model:'roles', key:'id'}},
            email: {type: Sequelize.STRING, unique: true, deferrable: Sequelize.Deferrable.SET_DEFERRED},
            
            password: {type: Sequelize.STRING, allowNull: false},
            phone: {type: Sequelize.STRING},
            last_ip: {type: Sequelize.STRING},
            keep_connected: {type: Sequelize.BOOLEAN},
            last_accepted_term_version: {type: Sequelize.STRING},
        },
        {
            sequelize: connection,
            modelName: 'User',
            tableName: 'users',
            freezeTableName: false
        },
    );
};

module.exports = init;