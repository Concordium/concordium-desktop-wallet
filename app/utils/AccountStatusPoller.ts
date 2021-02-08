import { Dispatch, Account, AccountStatus } from './types';
import { confirmAccount } from '../features/AccountSlice';
import { isInitialAccount } from './accountHelpers';
import { getAllAccounts } from '../database/AccountDao';

function resumeAccountStatusPolling(account: Account, dispatch: Dispatch) {
    const { name, credentialDeploymentHash } = account;
    if (!credentialDeploymentHash) {
        throw new Error('Unexpected missing credentialDeploymentHash.');
    }
    return confirmAccount(dispatch, name, credentialDeploymentHash);
}

export default async function listenForAccountStatus(dispatch: Dispatch) {
    const accounts = await getAllAccounts();
    accounts
        .filter(
            (account) =>
                account.status === AccountStatus.Pending &&
                !isInitialAccount(account)
        )
        .forEach((account) => resumeAccountStatusPolling(account, dispatch));
}
