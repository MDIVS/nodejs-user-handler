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
                handler: async (request) => {
                    const { record } = request.payload;
                    let new_record = await this.db.models.User.create(record);
                    
                    return {
                        message: 'Record successfully commited to database.',
                        record: new_record
                    };
                }
            }
        }
    ];
}

module.exports = UserRoutes