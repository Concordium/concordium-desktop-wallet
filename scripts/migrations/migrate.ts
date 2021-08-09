/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import ScriptMigrationSource from './ScriptMigrationSource';
import { getDevelopmentKnexConfiguration } from '../../app/database/developmentKnexFile';

const externalKnex = require('knex');

export default async function knex() {
    const password = process.argv[2];

    if (!password) {
        throw new Error('Please provide database password as argument');
    }

    const configuration = await getDevelopmentKnexConfiguration(password);
    return externalKnex(configuration);
}

export function getConfig() {
    return {
        migrationSource: new ScriptMigrationSource(
            './app/database/migrations',
            false,
            /.ts$/
        ),
    };
}
