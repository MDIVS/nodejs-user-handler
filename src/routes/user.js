import Boom from '@hapi/boom';
import Joi from 'joi';
import User from '../models/user.js';
import mapSequelizeError from '../utils/map-sequelize-error.js';

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
    }
];