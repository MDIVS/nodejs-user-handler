import { Sequelize, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

class User extends Model {}

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
        fullname: {type: Sequelize.STRING},
        username: {type: Sequelize.STRING, allowNull: false, unique: true, deferrable: Sequelize.Deferrable.SET_DEFERRED},

        // role_id: {type: Sequelize.INTEGER, references: {model:'roles', key:'id'}},
        email: {type: Sequelize.STRING, unique: true, deferrable: Sequelize.Deferrable.SET_DEFERRED},

        profile_picture_external_url: {type: Sequelize.STRING},
        
        password: {type: Sequelize.STRING},
        phone: {type: Sequelize.STRING},
        last_ip: {type: Sequelize.STRING},
        keep_connected: {type: Sequelize.BOOLEAN},
        last_accepted_term_version: {type: Sequelize.STRING},
        active: {type: Sequelize.BOOLEAN, defaultValue: true},
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        freezeTableName: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

export default User;