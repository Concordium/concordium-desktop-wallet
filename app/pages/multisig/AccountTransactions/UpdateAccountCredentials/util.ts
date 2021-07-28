export enum CredentialStatus {
    Original,
    Unchanged,
    Added,
    Removed,
}

/**
 * [credentialId, credentialStatus, note]
 */
export type CredentialDetails = [string, CredentialStatus, string | undefined];
