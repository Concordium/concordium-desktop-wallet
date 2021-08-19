import type { TransferTransaction } from '~/utils/types';

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

export interface GetTransactionsOutput {
    transactions: TransferTransaction[];
    more: boolean;
}
