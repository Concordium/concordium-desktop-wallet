import { knex } from '~/database/knex';
import { Preference, PreferenceKey } from '~/database/types';
import { preferencesTable } from '~/constants/databaseNames.json';
import { Hex } from '~/utils/types';
import { PreferenceAccessor, PreferencesMethods } from '../preloadTypes';

async function getPreference(key: PreferenceKey): Promise<Preference> {
    return (await knex())
        .table(preferencesTable)
        .select(`${preferencesTable}.value`)
        .where({ key })
        .first();
}
async function setPreference(key: PreferenceKey, value: string) {
    return (await knex())
        .table(preferencesTable)
        .where({ key })
        .update({ value });
}

function buildAccessor<V = string>(
    key: PreferenceKey,
    isJson = false
): PreferenceAccessor<V> {
    const parse = isJson ? JSON.parse : (v: string) => v;
    const serialize = isJson ? JSON.stringify : (v: string) => v;

    return {
        async get() {
            const { value } = await getPreference(key);

            if (!value) {
                return null;
            }
            return parse(value) as V;
        },
        async set(value: V) {
            await setPreference(key, serialize(value));
        },
    };
}

const exposedMethods: PreferencesMethods = {
    favouriteAccount: buildAccessor<Hex>(PreferenceKey.FAVOURITE_ACCOUNT),
    accountSimpleView: buildAccessor<boolean>(
        PreferenceKey.ACCOUNT_PAGE_SIMPLE,
        true
    ),
};

export default exposedMethods;
