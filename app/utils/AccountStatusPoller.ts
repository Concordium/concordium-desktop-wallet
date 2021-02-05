import { Dispatch, Account } from './types';
import { confirmAccount } from '../features/AccountSlice';

export default function resumeAccountStatusPolling(
    account: Account,
    dispatch: Dispatch
) {
    const { name, credentialDeploymentId } = account;
    if (!credentialDeploymentId) {
        throw new Error('Unexpected missing credentialDeploymentId.');
    }
    return confirmAccount(dispatch, name, credentialDeploymentId);
}
