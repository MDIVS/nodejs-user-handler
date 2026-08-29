import { Sequelize, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

class Permission extends Model {}

Permission.init(
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        parent_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'permissions',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Permission',
        tableName: 'permissions',
        freezeTableName: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

export default Permission;
