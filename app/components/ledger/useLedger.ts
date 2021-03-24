import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import getErrorDescription from '~/features/ledger/ErrorCodes';
import ledgerReducer, {
    connectedAction,
    errorAction,
    getInitialState,
    pendingAction,
    resetAction,
    setStatusTextAction,
} from './ledgerReducer';
import {
    LedgerStatusType,
    isConcordiumApp,
    instanceOfTransportStatusError,
    LedgerSubmitHandler,
    LedgerCallback,
} from './util';

export default function useLedger(
    ledgerCallback: LedgerCallback
): {
    status: LedgerStatusType;
    statusText: string;
    submitHandler: LedgerSubmitHandler;
} {
    const [{ status, text }, dispatch] = useReducer(
        ledgerReducer,
        getInitialState()
    );
    const [client, setClient] = useState<ConcordiumLedgerClient | undefined>(
        undefined
    );

    const [ledgerSubscription, setLedgerSubscription] = useState<
        Subscription | undefined
    >(undefined);

    const ledgerObserver: Observer<DescriptorEvent<string>> = useMemo(() => {
        return {
            complete: () => {
                // This is expected to never trigger.
            },
            error: () => {
                dispatch(errorAction());
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: async (event: any) => {
                if (event.type === 'add') {
                    const transport = await TransportNodeHid.open(event.path);
                    const concordiumClient = new ConcordiumLedgerClient(
                        transport
                    );
                    const appAndVersion = await concordiumClient.getAppAndVersion();

                    if (isConcordiumApp(appAndVersion)) {
                        dispatch(
                            connectedAction(
                                event.deviceModel.productName,
                                concordiumClient
                            )
                        );
                    } else {
                        // The device has been connected, but the Concordium application has not
                        // been opened yet.
                        dispatch(pendingAction(LedgerStatusType.OPEN_APP));
                    }
                } else {
                    dispatch(resetAction());
                }
            },
        };
    }, []);

    const listenForLedger = useCallback(() => {
        if (!ledgerSubscription) {
            const subscription = TransportNodeHid.listen(ledgerObserver);
            setLedgerSubscription(subscription);
        }
    }, [ledgerSubscription, ledgerObserver]);

    const submitHandler: LedgerSubmitHandler = useCallback(async () => {
        dispatch(pendingAction(LedgerStatusType.AWAITING_USER_INPUT));

        try {
            if (client) {
                await ledgerCallback(client, (t) =>
                    dispatch(setStatusTextAction(t))
                );
            }
        } catch (e) {
            let errorMessage;
            if (instanceOfTransportStatusError(e)) {
                errorMessage = getErrorDescription(e.statusCode);
            } else {
                errorMessage = `An error occurred: ${e}`;
            }
            errorMessage += ' Please try again.';
            dispatch(errorAction(errorMessage));
        }
    }, [client, ledgerCallback]);

    useEffect(() => {
        listenForLedger();
        return function cleanup() {
            if (ledgerSubscription !== undefined) {
                ledgerSubscription.unsubscribe();
            }
            if (client) {
                client.closeTransport();
                setClient(undefined);
            }
        };
    }, [ledgerSubscription, listenForLedger, client]);

    return {
        status,
        statusText: text,
        submitHandler,
    };
}
