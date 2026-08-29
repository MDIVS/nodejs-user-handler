import { Sequelize, Model } from 'sequelize';
import sequelize from '../db/sequelize.js';

class PermissionAssignment extends Model {}

PermissionAssignment.init(
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            deferrable: Sequelize.Deferrable.SET_DEFERRED,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        permission_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'permissions',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
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
        modelName: 'PermissionAssignment',
        tableName: 'permission_assignments',
        freezeTableName: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'permission_id'],
                name: 'permission_assignments_user_permission_unique',
            },
        ],
    },
);

export default PermissionAssignment;
