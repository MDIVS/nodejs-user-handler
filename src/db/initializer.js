import sequelize from './sequelize.js';
import UserAuthProvider from '../models/user-auth-provider.js';
import User from '../models/user.js';
import Permission from '../models/permission.js';
import PermissionAssignment from '../models/permission-assignment.js';

User.hasMany(UserAuthProvider, { foreignKey: 'user_id', as: 'user_auth_providers' });
UserAuthProvider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// N-N relationship through permission assignment
User.belongsToMany(Permission, {
    through: PermissionAssignment,
    foreignKey: 'user_id',
    otherKey: 'permission_id',
    as: 'permissions',
});
Permission.belongsToMany(User, {
    through: PermissionAssignment,
    foreignKey: 'permission_id',
    otherKey: 'user_id',
    as: 'users',
});

User.hasMany(PermissionAssignment, { foreignKey: 'user_id', as: 'permission_assignments' });
Permission.hasMany(PermissionAssignment, { foreignKey: 'permission_id', as: 'permission_assignments' });
PermissionAssignment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PermissionAssignment.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' });

try {
    await sequelize.authenticate();
    console.log('✅ Sequelize database connection has been established successfully.');
} catch (error) {
    throw Error(`Unable to connect to the database: ${error}`);
}

sequelize.sync();
