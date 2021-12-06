import {
    AttributeKeyName,
    AccountInfo,
    CredentialDeploymentInformation,
    EqualRecord,
    ConfirmedIdentity,
    CommitmentsRandomness,
} from '~/utils/types';

export interface CredentialBlob {
    credential: CredentialDeploymentInformation;
    randomness: CommitmentsRandomness;
    identityId: number;
    credentialNumber: number;
    address: string;
}

export interface AccountForm {
    identity: ConfirmedIdentity;
    address: string;
    accountInfo: AccountInfo;
    accountName: string;
    chosenAttributes: AttributeKeyName[];
    credential: CredentialBlob;
}

export const fieldNames: EqualRecord<AccountForm> = {
    identity: 'identity',
    address: 'address',
    accountInfo: 'accountInfo',
    accountName: 'accountName',
    chosenAttributes: 'chosenAttributes',
    credential: 'credential',
};
