import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/user.js';
import Permission from '../models/permission.js';

const permissionsInclude = {
    model: Permission,
    as: 'permissions',
    attributes: ['id', 'name', 'description', 'parent_id'],
    through: { attributes: [] }
};

export default async function authenticateRequest(request) {
    const cookies = cookie.parse(request.headers.cookie || '');
    const session = cookies.session;

    if (!session) { throw Boom.unauthorized('No session.'); }

    let decoded;
    try { decoded = jwt.verify(session, process.env.JWT_SECRET); }
    catch (err) { throw Boom.unauthorized('Invalid session.'); }

    const user = await User.findOne({ where: { id: decoded.id }, include: [permissionsInclude] });

    if (!user) { throw Boom.unauthorized('User not found.'); }
    if (!user.active) { throw Boom.unauthorized('Deactivated user.'); }

    return user;
}
