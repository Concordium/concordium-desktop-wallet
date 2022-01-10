import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import { Setting } from '~/utils/types';
import settingKeys from '../../constants/settingKeys.json';

interface AddressPort {
    address: string;
    port: string;
}

const oldDefault: AddressPort = { address: '127.0.0.1', port: '10000' };
const newDefault: AddressPort = {
    address: 'concordiumwalletnode.com',
    port: '10000',
};

/**
 * Migrates the node setting to a new default. The setting is only updated if the current
 * setting is set to the previous default value. This is to prevent migrating the setting
 * for users who have already changed the setting to another node that they are using.
 */
async function migrateDefaultNode(
    knex: Knex,
    previousDefault: AddressPort,
    updatedDefault: AddressPort
): Promise<number | void> {
    const currentNodeSetting = (
        await knex
            .table<Setting>(databaseNames.settingsTable)
            .where({ name: settingKeys.nodeLocation })
    )[0];
    const addressAndPort: AddressPort = JSON.parse(currentNodeSetting.value);

    if (
        addressAndPort.address === previousDefault.address &&
        addressAndPort.port === previousDefault.port
    ) {
        const newDefaultSetting = JSON.stringify(updatedDefault);
        return knex
            .table(databaseNames.settingsTable)
            .update({ value: newDefaultSetting })
            .where({ name: settingKeys.nodeLocation });
    }
    return Promise.resolve();
}

export async function up(knex: Knex): Promise<number | void> {
    if (getTargetNet() === Net.Mainnet) {
        return migrateDefaultNode(knex, oldDefault, newDefault);
    }
    return Promise.resolve();
}

export async function down(knex: Knex): Promise<number | void> {
    if (getTargetNet() === Net.Mainnet) {
        return migrateDefaultNode(knex, newDefault, oldDefault);
    }
    return Promise.resolve();
}
