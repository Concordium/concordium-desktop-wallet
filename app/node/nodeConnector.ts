import { loadGlobal } from '../features/GlobalSlice';
import listenForAccountStatus from '../utils/AccountStatusPoller';
import listenForTransactionStatus from '../utils/TransactionStatusPoller';
import { Dispatch } from '../utils/types';
import { setClientLocation } from './nodeRequests';

export default async function startClient(
    dispatch: Dispatch,
    address: string,
    port: string
) {
    await setClientLocation(address, port);

    loadGlobal(dispatch);
    listenForAccountStatus(dispatch);
    listenForTransactionStatus(dispatch);
}
