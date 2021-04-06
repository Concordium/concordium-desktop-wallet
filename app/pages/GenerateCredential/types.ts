import { CredentialDeploymentInformation } from '~/utils/types';

export interface CredentialBlob {
    credential: CredentialDeploymentInformation;
    identityId: number;
    credentialNumber: number;
    address: string;
}
