const { OAuth2Client } = require('google-auth-library');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthRoutes {
    /**
     * @param {Sequelize} db sequelize connection to database
     */
    constructor(db) {
        this.db = db;
    }

    routes = [
        {
            path: '/auth/sso',
            method: 'POST',
            options: {
                tags: ['api'],
                description: 'Authorize by using a third party authentication provider',
                validate: {
                    payload: Joi.object({
                        token: Joi.string().required()
                    })
                },
                handler: async (request, h) => {
                    try {
                        const { token } = request.payload;

                        let google_response;

                        try {
                            const ticket = await client.verifyIdToken({
                                idToken: token,
                                audience: process.env.GOOGLE_CLIENT_ID,
                            });
                            google_response = ticket.getPayload();
                        } catch(error) {
                            return h.response({ message: 'The provided token is invalid.' }).code(401);
                        };

                        if (!google_response.email_verified) console.warn('SSO login with an unverified user email:', google_response);

                        let user = await this.db.models.User.findOne({where: {email: google_response.email}});
                        let authRecord;
                        if (user) {
                            if (!user.active) return h.response({ message: 'Deactivated user.' }).code(401);

                            authRecord = await this.db.models.UserAuthProvider.findOne({
                                where: { provider: google_response.iss, provider_user_id: google_response.sub },
                            });

                            if (authRecord && authRecord.provider_user_id !== google_response.sub) {
                                return h.response({
                                    message: 'User already exists with same email but a different Google Id (sub). We are blocking the access for security reasons. Please contact us if you think it is a mistake.'
                                }).code(401);
                            }
                        } else {
                            user = await this.db.models.User.create({
                                email: google_response.email,
                                fullname: google_response.name,
                                firstname: google_response.given_name,
                                lastname: google_response.family_name,
                                username: google_response.email,
                                profile_picture_external_url: google_response.picture
                            });
                        }

                        if (!authRecord) {
                            authRecord = await this.db.models.UserAuthProvider.create({
                                user_id: user.id,
                                provider: google_response.iss,
                                provider_user_id: google_response.sub,
                                accessToken: token
                            });
                        }

                        const jwtToken = jwt.sign(
                            { userId: user.id },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        return h.response({
                            token: jwtToken,
                            user: {
                                id: user.id,
                                preferredname: user.preferredname,
                                firstname: user.firstname,
                                middlename: user.middlename,
                                lastname: user.lastname,
                                fullname: user.fullname,
                                username: user.username,
                                email: user.email,
                                profile_picture_external_url: user.profile_picture_external_url
                            }
                        }).code(200);
                    } catch (error) {
                        console.error('Error in /auth/sso route:', error);
                        return h.response({ error: 'Authentication failed' }).code(500);
                    }
                }
            }
        }
    ];
}

module.exports = AuthRoutes