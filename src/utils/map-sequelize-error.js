import Boom from '@hapi/boom';
import { UniqueConstraintError } from 'sequelize';

export default function mapSequelizeError(error) {
    if (error instanceof UniqueConstraintError) {
        const fields = Object.keys(error.fields || {});
        throw Boom.conflict(`Already in use: ${fields.join(', ')}`);
    }
}