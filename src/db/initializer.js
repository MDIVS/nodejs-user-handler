import sequelize from './sequelize.js';
import UserAuthProvider from '../models/user-auth-provider.js';
import User from '../models/user.js';

User.hasMany(UserAuthProvider, { foreignKey: 'user_id', as: 'user_auth_providers' });
UserAuthProvider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

try {
    await sequelize.authenticate();
    console.log('✅ Sequelize database connection has been established successfully.');
} catch (error) {
    throw Error(`Unable to connect to the database: ${error}`);
}

sequelize.sync();
