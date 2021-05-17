import { Knex, knex as externalKnex } from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV;
let password: string;

/* eslint-disable @typescript-eslint/no-explicit-any */
let knexSingleton:
    | Knex<any, unknown[]>
    | PromiseLike<Knex<any, unknown[]>>
    | undefined;

/**
 * Sets the encryption/decryption password for the
 * database.
 */
export function setPassword(dbPassword: string) {
    password = dbPassword;
}

export function isPasswordSet() {
    return password !== undefined;
}

export function invalidateKnexSingleton() {
    knexSingleton = undefined;
}

/* eslint-disable global-require */
export async function knex(): Promise<Knex> {
    if (!environment) {
        throw new Error('Unable to determine environment');
    }

    if (!password) {
        throw new Error('A password has not been set yet');
    }

    if (!knexSingleton) {
        const configuration = await config(environment, password);
        knexSingleton = externalKnex(configuration);
    }
    return knexSingleton;
}
