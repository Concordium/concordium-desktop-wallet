import config from './knexfile';

const environment = process.env.NODE_ENV;

/* eslint-disable global-require */
export default async function getKnex() {
    if (!environment) {
        throw new Error('unable to determine environment');
    }
    const configuration = await config(environment);
    return require('knex')(configuration);
}
