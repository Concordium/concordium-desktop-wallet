/**
 * The interface for rows in the 'genesis' table.
 */
export interface Genesis {
    id: number;
    genesisBlock: string;
}

export interface ExternalCredential {
    address: string;
    credId: string;
    note: string;
}
