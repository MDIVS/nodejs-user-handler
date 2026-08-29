import Boom from '@hapi/boom';
import Joi from 'joi';
import User from '../models/user.js';
import UserAuthProvider from '../models/user-auth-provider.js';
import Permission from '../models/permission.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import mapSequelizeError from '../utils/map-sequelize-error.js';
import cookie from 'cookie';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const permissionsInclude = {
    model: Permission,
    as: 'permissions',
    attributes: ['name', 'description'],
    through: { attributes: [] }
};

const generateSessionToken = (user) => jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const buildUserPayload = (user) => ({
    id: user.id,
    preferredname: user.preferredname,
    firstname: user.firstname,
    middlename: user.middlename,
    lastname: user.lastname,
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    profile_picture_external_url: user.profile_picture_external_url
});

const buildPermissionsPayload = (user) => (user.permissions || []).map(({ name, description }) => ({ name, description }));

const buildAuthResponsePayload = (user) => ({
    user: buildUserPayload(user),
    permissions: buildPermissionsPayload(user)
});

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

                    const user = await User.findOne({ where: { username }, include: [permissionsInclude] });

                    if (!user) { return Boom.unauthorized('Invalid user.'); }
                    if (!user.active) { return Boom.unauthorized('Deactivated user.'); }
                    if (user.password !== password) { return Boom.unauthorized('Invalid credentials.'); }

                    const jwtToken = generateSessionToken(user);

                    return h.response(buildAuthResponsePayload(user))
                        .state('session', jwtToken);
                } catch (error) {
                    mapSequelizeError(error);

                    console.error('Error in POST /auth/login route:', error);
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

                    const ticket = await client.verifyIdToken({
                        idToken: token,
                        audience: process.env.GOOGLE_CLIENT_ID,
                    });

                    let google_response = ticket.getPayload();

                    if (!google_response.email_verified) console.warn('SSO login with an unverified user email:', google_response);

                    let user = await User.findOne({ where: { email: google_response.email }, include: [permissionsInclude] });
                    let authRecord;

                    if (user) {
                        if (!user.active) return Boom.unauthorized( 'Deactivated user.' );

                        authRecord = await UserAuthProvider.findOne({
                            where: { provider: google_response.iss, provider_user_id: google_response.sub },
                        });

                        if (authRecord && authRecord.provider_user_id !== google_response.sub) {
                            user.active = false;
                            await user.save();
                            return Boom.unauthorized( 'User already exists with same email but a different Google Id (sub). We are blocking the access for security reasons. Please contact us if you think it is a mistake.' );
                        }

                        if (user.profile_picture_external_url != google_response.picture) {
                            user.profile_picture_external_url = google_response.picture;
                            await user.save();
                        }
                    } else {
                        user = await User.create({
                            email: google_response.email,
                            fullname: google_response.name,
                            username: google_response.email,
                            profile_picture_external_url: google_response.picture
                        });
                        await user.reload({ include: [permissionsInclude] });
                    }

                    if (!authRecord) {
                        authRecord = await UserAuthProvider.create({
                            user_id: user.id,
                            provider: google_response.iss,
                            provider_user_id: google_response.sub,
                        });
                    }

                    const jwtToken = generateSessionToken(user);

                    return h.response(buildAuthResponsePayload(user))
                        .state('session', jwtToken);
                } catch (error) {
                    mapSequelizeError(error);

                    console.error('Error in POST /auth/sso route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/auth/me',
        method: 'GET',
        options: {
            tags: ['api'],
            description: 'Get current session user',
            handler: async (request, h) => {
                try {
                    const cookies = cookie.parse(request.headers.cookie || '');
                    const session = cookies.session;

                    if (!session) { return Boom.unauthorized('No session.'); }

                    let decoded;
                    try { decoded = jwt.verify(session, process.env.JWT_SECRET); }
                    catch (err) { return Boom.unauthorized('Invalid session.'); }

                    const user = await User.findOne({ where: { id: decoded.id }, include: [permissionsInclude] });

                    if (!user) { return Boom.unauthorized('Invalid user.'); }
                    if (!user.active) { return Boom.unauthorized('Deactivated user.'); }

                    return buildAuthResponsePayload(user);
                } catch (error) {
                    mapSequelizeError(error);

                    console.error('Error in GET /auth/me route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/auth/logout',
        method: 'POST',
        options: {
            tags: ['api'],
            description: 'Logout user',
            handler: async (request, h) => {
                return h.response({}).unstate('session');
            }
        }
    }
];
