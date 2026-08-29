import Boom from '@hapi/boom';
import Joi from 'joi';
import User from '../models/user.js';
import Permission from '../models/permission.js';
import mapSequelizeError from '../utils/map-sequelize-error.js';

const permissionsInclude = {
    model: Permission,
    as: 'permissions',
    attributes: ['name', 'description'],
    through: { attributes: [] }
};

export default [
    {
        path: '/user',
        method: 'POST',
        options: {
            tags: ['api'],
            description: 'Create a user',
            validate: {
                payload: Joi.object({
                    user: Joi.object({
                        preferredname: Joi.string().max(255).optional().example('John'),
                        fullname: Joi.string().max(255).required().example('John Smith'),
                        username: Joi.string().max(255).required().example('johnsmith'),
                        password: Joi.string().max(255).required().example('Jhon@1984'),
                        email: Joi.string().email().max(255).required().example('john@gmail.com'),
                        phone: Joi.string().max(255).example('+1 (555) 123-4567')
                    }).required()
                }).required()
            },
            handler: async (request) => {
                try {
                    const { user } = request.payload;
                    
                    let new_user = await User.create(user);
                    
                    return {
                        message: 'Record successfully committed to database.',
                        user: new_user
                    };
                } catch(error) {
                    mapSequelizeError(error);

                    console.log('Error in POST /user route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/users',
        method: 'GET',
        options: {
            tags: ['api'],
            description: 'List all users',
            handler: async (request) => {
                try {
                    const users = await User.findAll({
                        attributes: ['id', 'preferredname', 'fullname', 'username', 'email', 'phone', 'active', 'created_at', 'updated_at']
                    });
                    
                    return { users };
                } catch(error) {
                    console.log('Error in GET /users route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/user',
        method: 'GET',
        options: {
            tags: ['api'],
            description: 'Get a user by username',
            validate: {
                query: Joi.object({
                    username: Joi.string().required().example('johnsmith')
                }).required()
            },
            handler: async (request) => {
                try {
                    const user = await User.findOne({
                        where: { username: request.query.username },
                        attributes: ['preferredname', 'username', 'active', 'created_at'],
                        include: [permissionsInclude]
                    });
                    
                    if (!user) { throw Boom.notFound('User not found'); }
                    
                    return { user };
                } catch(error) {
                    if (error.isBoom) { throw error; }
                    console.log('Error in GET /user route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/user',
        method: 'PATCH',
        options: {
            tags: ['api'],
            description: 'Update a user',
            validate: {
                query: Joi.object({
                    username: Joi.string().required().example('johnsmith')
                }).required(),
                payload: Joi.object({
                    user: Joi.object({
                        phone: Joi.string().max(255).optional().allow('', null),
                        fullname: Joi.string().max(255).optional(),
                        preferredname: Joi.string().max(255).optional().allow('', null),
                        profile_picture_external_url: Joi.string().max(2048).optional().allow('', null),
                        keep_connected: Joi.boolean().optional()
                    }).min(1).required()
                }).required()
            },
            handler: async (request) => {
                try {
                    const { username } = request.query;
                    const { user: updateData } = request.payload;

                    const userRecord = await User.findOne({ where: { username } });
                    
                    if (!userRecord) { throw Boom.notFound('User not found'); }
                    
                    const allowedFields = ['phone', 'fullname', 'preferredname', 'profile_picture_external_url', 'keep_connected'];
                    const dataToUpdate = {};
                    for (const field of allowedFields) {
                        if (updateData[field] !== undefined) {
                            dataToUpdate[field] = updateData[field];
                        }
                    }
                    
                    if (Object.keys(dataToUpdate).length > 0) {
                        await userRecord.update(dataToUpdate);
                    }
                    
                    return {
                        message: 'User successfully updated.',
                        user: await User.findOne({
                            where: { username },
                            // Return the updated fields plus some identifying ones
                            attributes: ['id', 'username', 'fullname', 'preferredname', 'phone', 'profile_picture_external_url', 'keep_connected', 'updated_at']
                        })
                    };
                } catch(error) {
                    if (error.isBoom) { throw error; }
                    mapSequelizeError(error);

                    console.log('Error in PATCH /user route:', error);
                    throw Boom.internal();
                }
            }
        }
    }
];