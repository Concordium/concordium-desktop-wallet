import { Knex, knex } from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV;

/* eslint-disable @typescript-eslint/no-explicit-any */
let knexSingleton:
    | Knex<any, unknown[]>
    | PromiseLike<Knex<any, unknown[]>>
    | undefined;

/* eslint-disable global-require */
export default async function getKnex(): Promise<Knex> {
    if (!environment) {
        throw new Error('Unable to determine environment');
    }

    if (!knexSingleton) {
        const configuration = await config(environment);
        knexSingleton = knex(configuration);
    }
    return knexSingleton;
}
