import { Dispatch, Account, AccountStatus } from './types';
import { confirmAccount } from '../features/AccountSlice';
import { isInitialAccount } from './accountHelpers';
import { getAllAccounts } from '../database/AccountDao';
import { throwLoggedError } from './basicHelpers';

function resumeAccountStatusPolling(account: Account, dispatch: Dispatch) {
    const { address, deploymentTransactionId } = account;
    if (!deploymentTransactionId) {
        throwLoggedError('Unexpected missing deploymentTransactionId');
    }
    return confirmAccount(dispatch, address, deploymentTransactionId);
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
