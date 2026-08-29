import Boom from '@hapi/boom';
import Joi from 'joi';
import { Op } from 'sequelize';
import User from '../models/user.js';
import Permission from '../models/permission.js';
import PermissionAssignment from '../models/permission-assignment.js';
import mapSequelizeError from '../utils/map-sequelize-error.js';
import authenticateRequest from '../utils/authenticate-request.js';

const canAssignPermission = (requester, permission) =>
    !permission.parent_id || requester.permissions.some((perm) => perm.id === permission.parent_id);

export default [
    {
        path: '/permissions',
        method: 'GET',
        options: {
            tags: ['api'],
            description: 'List permissions the current session user is allowed to assign, optionally filtered by name and excluding permissions a given user already has',
            validate: {
                query: Joi.object({
                    q: Joi.string().max(255).optional().allow('').example('admin'),
                    username: Joi.string().optional().example('johnsmith')
                })
            },
            handler: async (request) => {
                try {
                    const requester = await authenticateRequest(request);
                    const { q, username } = request.query;

                    const where = { active: true };
                    if (q) { where.name = { [Op.iLike]: `%${q}%` }; }

                    if (username) {
                        const targetUser = await User.findOne({
                            where: { username },
                            include: [{ model: Permission, as: 'permissions', attributes: ['id'], through: { attributes: [] } }]
                        });

                        if (!targetUser) { throw Boom.notFound('User not found'); }

                        const alreadyAssignedIds = targetUser.permissions.map((perm) => perm.id);
                        if (alreadyAssignedIds.length) { where.id = { [Op.notIn]: alreadyAssignedIds }; }
                    }

                    const permissions = await Permission.findAll({
                        where,
                        attributes: ['id', 'name', 'description', 'parent_id'],
                        include: [{ model: Permission, as: 'parent', attributes: ['id', 'name'] }],
                        order: [['name', 'ASC']]
                    });

                    const assignablePermissions = permissions.filter((permission) => canAssignPermission(requester, permission));

                    return { permissions: assignablePermissions };
                } catch (error) {
                    if (error.isBoom) { throw error; }

                    console.error('Error in GET /permissions route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/permission/assignment',
        method: 'POST',
        options: {
            tags: ['api'],
            description: 'Assign a permission to a user. The session user must already hold the permission\'s parent, if it has one.',
            validate: {
                payload: Joi.object({
                    username: Joi.string().required().example('johnsmith'),
                    permission_name: Joi.string().required().example('tester')
                }).required()
            },
            handler: async (request) => {
                try {
                    const requester = await authenticateRequest(request);
                    const { username, permission_name } = request.payload;

                    const targetUser = await User.findOne({ where: { username } });
                    if (!targetUser) { throw Boom.notFound('User not found'); }

                    const permission = await Permission.findOne({ where: { name: permission_name } });
                    if (!permission) { throw Boom.notFound('Permission not found'); }

                    if (!canAssignPermission(requester, permission)) {
                        throw Boom.forbidden('You do not have the parent permission required to assign this permission.');
                    }

                    const [, created] = await PermissionAssignment.findOrCreate({
                        where: { user_id: targetUser.id, permission_id: permission.id }
                    });

                    if (!created) { throw Boom.conflict('User already has this permission assigned.'); }

                    return {
                        message: 'Permission successfully assigned.',
                        permission: { name: permission.name, description: permission.description }
                    };
                } catch (error) {
                    if (error.isBoom) { throw error; }
                    mapSequelizeError(error);

                    console.error('Error in POST /permission/assignment route:', error);
                    throw Boom.internal();
                }
            }
        }
    },
    {
        path: '/permission/assignment',
        method: 'DELETE',
        options: {
            tags: ['api'],
            description: 'Remove a permission from a user. The session user must already hold the permission\'s parent, if it has one.',
            validate: {
                query: Joi.object({
                    username: Joi.string().required().example('johnsmith'),
                    permission_name: Joi.string().required().example('tester')
                }).required()
            },
            handler: async (request) => {
                try {
                    const requester = await authenticateRequest(request);
                    const { username, permission_name } = request.query;

                    const targetUser = await User.findOne({ where: { username } });
                    if (!targetUser) { throw Boom.notFound('User not found'); }

                    const permission = await Permission.findOne({ where: { name: permission_name } });
                    if (!permission) { throw Boom.notFound('Permission not found'); }

                    if (!canAssignPermission(requester, permission)) {
                        throw Boom.forbidden('You do not have the parent permission required to remove this permission.');
                    }

                    const deletedCount = await PermissionAssignment.destroy({
                        where: { user_id: targetUser.id, permission_id: permission.id }
                    });

                    if (!deletedCount) { throw Boom.notFound('User does not have this permission assigned.'); }

                    return { message: 'Permission successfully removed.' };
                } catch (error) {
                    if (error.isBoom) { throw error; }

                    console.error('Error in DELETE /permission/assignment route:', error);
                    throw Boom.internal();
                }
            }
        }
    }
];
