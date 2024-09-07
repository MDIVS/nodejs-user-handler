const Joi = require('joi');
const Boom = require('boom');
const { Sequelize, Op } = require('sequelize');

class UserRoutes {
    /**
     * @param {Sequelize} db sequelize connection to database
     */
    constructor(db) {
        this.db = db;
    }

    routes = [
        {
            path: '/user',
            method: 'POST',
            options: {
                tags: ['api'],
                description: 'Creates user in database',
                validate: {
                    payload: Joi.object({
                        record: {
                            username:                   Joi.string().min(5).max(100).required(),
                            password:                   Joi.string().optional().min(8).max(16).required()
                        }
                    })
                },
            },
            handler: async (request) => {
                try {
                    const { record } = request.payload;

                    let user = await this.db.models.User.findOne({where: {[Op.or]:[{username:record.username}]}});

                    if (user) {
                        if (user.username == record.username) return Boom.conflict('Username already taken');
                        return Boom.internal('Unknown error while searching for user conflicts');
                    }

                    await this.db.models.User.create(record);

                    return {message: 'User registered successfully.'}
                } catch(error) {console.log(error)}
            }
        }
    ];
}

module.exports = UserRoutes;