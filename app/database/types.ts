/**
 * The interface for rows in the 'genesis' table.
 */
export interface Genesis {
    id: number;
    genesisBlock: string;
}

export interface ExternalCredential {
    accountAddress: string;
    credId: string;
    note: string;
}

export enum PreferenceKey {
    DEFAULT_ACCOUNT = 'defaultAccount',
    ACCOUNT_PAGE_SIMPLE = 'accountPageSimple',
}

export interface Preference {
    key: PreferenceKey;
    value: string | null;
}
