const Joi = require('joi');

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
                            firstname:                  Joi.string().min(3).max(100).required(),
                            middlename:                 Joi.string().min(3).max(100),
                            lastname:                   Joi.string().min(3).max(100).required(),
                            fullname:                   Joi.string().min(3).max(255).required(),
                            preferredname:              Joi.string().min(3).max(32),

                            email:                      Joi.string().email({minDomainSegments: 1}).required(),
                            phone:                      Joi.string().min(8).max(13).allow(null,''),
                            password:                   Joi.string().optional().min(8).max(16).required()
                        }
                    })
                },
            },
            handler: async (request) => {
                const { record } = request.payload;
                let new_record = await this.db.models.User.create(record);
                
                return {
                    message: 'Record successfully commited to database.',
                    record: new_record
                };
            }
        }
    ];
}

module.exports = UserRoutes