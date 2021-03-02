import { loadGlobal } from '../features/GlobalSlice';
import listenForAccountStatus from './AccountStatusPoller';
import listenForTransactionStatus from './TransactionStatusPoller';
import { Dispatch } from './types';
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
