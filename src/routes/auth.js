import Boom from '@hapi/boom';
import Joi from 'joi';
import User from '../models/user.js';
import UserAuthProvider from '../models/user-auth-provider.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import mapSequelizeError from '../utils/map-sequelize-error.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default [
    {
        path: '/auth/login',
        method: 'POST',
        options: {
            tags: ['api'],
            description: 'Login using username and password',
            validate: {
                payload: Joi.object({
                    username: Joi.string().max(255).required().example('johnsmith'),
                    password: Joi.string().max(255).required().example('Jhon@1984')
                }).required()
            },
            handler: async (request, h) => {
                try {
                    const { username, password } = request.payload;

                    const user = await User.findOne({ where: { username } });

                    if (!user) { return Boom.unauthorized('Invalid user.'); }
                    if (!user.active) { return Boom.unauthorized('Deactivated user.'); }
                    if (user.password !== password) { return Boom.unauthorized('Invalid credentials.'); }

                    const jwtToken = jwt.sign(
                        { id: user.id, email: user.email },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    return h.response({
                        user: {
                            id: user.id,
                            preferredname: user.preferredname,
                            fullname: user.fullname,
                            username: user.username,
                            email: user.email,
                            profile_picture_external_url: user.profile_picture_external_url
                        }
                    })
                        .state('session', jwtToken);
                } catch (error) {
                    mapSequelizeError(error);

                    console.error('Error in /auth/login route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
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
                        return Boom.unauthorized( 'The provided token is invalid.' );
                    };

                    if (!google_response.email_verified) console.warn('SSO login with an unverified user email:', google_response);

                    let user = await User.findOne({where: {email: google_response.email}});
                    let authRecord;

                    if (user) {
                        if (!user.active) return Boom.unauthorized( 'Deactivated user.' );

                        authRecord = await UserAuthProvider.findOne({
                            where: { provider: google_response.iss, provider_user_id: google_response.sub },
                        });

                        if (authRecord && authRecord.provider_user_id !== google_response.sub) {
                            return Boom.unauthorized( 'User already exists with same email but a different Google Id (sub). We are blocking the access for security reasons. Please contact us if you think it is a mistake.' );
                        }
                    } else {
                        user = await User.create({
                            email: google_response.email,
                            fullname: google_response.name,
                            username: google_response.email,
                            profile_picture_external_url: google_response.picture
                        });
                    }

                    if (!authRecord) {
                        authRecord = await UserAuthProvider.create({
                            user_id: user.id,
                            provider: google_response.iss,
                            provider_user_id: google_response.sub,
                            accessToken: token
                        });
                    }

                    const jwtToken = jwt.sign(
                        { id: user.id, email: user.email },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    return h.response({
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
                    })
                    .state('session', jwtToken);
                } catch (error) {
                    mapSequelizeError(error);

                    console.error('Error in /auth/sso route:', error);
                    throw Boom.internal();
                }
            }
        }
    }
];