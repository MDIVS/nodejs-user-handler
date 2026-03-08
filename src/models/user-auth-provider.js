import { Sequelize, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

class UserAuthProvider extends Model {}

UserAuthProvider.init(
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
        sequelize,
        modelName: 'UserAuthProvider',
        tableName: 'user_auth_providers',
        freezeTableName: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

export default UserAuthProvider;