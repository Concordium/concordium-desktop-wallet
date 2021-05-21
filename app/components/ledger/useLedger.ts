import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useReducer,
    Dispatch,
} from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';

import { singletonHook } from 'react-singleton-hook';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import getErrorDescription from '~/features/ledger/ErrorCodes';
import ledgerReducer, {
    connectedAction,
    errorAction,
    finishedAction,
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
import { instanceOfClosedWhileSendingError } from '~/features/ledger/ClosedWhileSendingError';

const { CONNECTED, ERROR, OPEN_APP, AWAITING_USER_INPUT } = LedgerStatusType;

function useLedger(): {
    isReady: boolean;
    status: LedgerStatusType;
    statusText: string | JSX.Element;
    client?: ConcordiumLedgerClient;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch: Dispatch<any>;
} {
    const [{ status, text, client }, dispatch] = useReducer(
        ledgerReducer,
        getInitialState()
    );

    const [ledgerSubscription, setLedgerSubscription] = useState<
        Subscription | undefined
    >(undefined);

    const ledgerObserver: Observer<DescriptorEvent<string>> = useMemo(
        () => {
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
                        const deviceName = event.deviceModel.productName;
                        const transport = await TransportNodeHid.open();
                        const concordiumClient = new ConcordiumLedgerClient(
                            transport
                        );
                        const appAndVersion = await concordiumClient.getAppAndVersion();

                        if (isConcordiumApp(appAndVersion)) {
                            dispatch(
                                connectedAction(deviceName, concordiumClient)
                            );
                        } else {
                            // The device has been connected, but the Concordium application has not
                            // been opened yet.
                            dispatch(pendingAction(OPEN_APP, deviceName));
                        }
                    } else if (event.type === 'remove') {
                        if (client) {
                            client.closeTransport();
                        }
                        dispatch(resetAction());
                    }
                },
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        if (!ledgerSubscription) {
            const subscription = TransportNodeHid.listen(ledgerObserver);
            setLedgerSubscription(subscription);
        }
        return function cleanup() {
            if (ledgerSubscription !== undefined) {
                ledgerSubscription.unsubscribe();
                setLedgerSubscription(undefined);
            }
        };
    }, [ledgerSubscription, ledgerObserver]);

    useEffect(() => {
        return function cleanup() {
            if (client) {
                client.closeTransport();
                dispatch(resetAction());
            }
        };
    }, [client]);

    return {
        isReady: (status === CONNECTED || status === ERROR) && Boolean(client),
        status,
        statusText: text,
        client,
        dispatch,
    };
}

const init = () => {
    const { status, text, client } = getInitialState();
    return {
        isReady: false,
        status,
        statusText: text,
        client,
        dispatch: () => {},
    };
};

const hook = singletonHook(init, useLedger);

export default function ExternalHook(
    ledgerCallback: LedgerCallback,
    onSignError: (e: unknown) => void
): {
    isReady: boolean;
    status: LedgerStatusType;
    statusText: string | JSX.Element;
    submitHandler: LedgerSubmitHandler;
} {
    const { isReady, status, statusText, client, dispatch } = hook();

    useEffect(() => {
        return function cleanup() {
            if (client) {
                client.closeTransport();
            }
        };
    }, [client]);

    const submitHandler: LedgerSubmitHandler = useCallback(async () => {
        dispatch(pendingAction(AWAITING_USER_INPUT));

        try {
            if (client) {
                await ledgerCallback(client, (t) =>
                    dispatch(setStatusTextAction(t))
                );

                dispatch(finishedAction());
            }
        } catch (e) {
            if (instanceOfClosedWhileSendingError(e)) {
                dispatch(finishedAction());
            } else {
                let errorMessage;
                if (instanceOfTransportStatusError(e)) {
                    errorMessage = getErrorDescription(e.statusCode);
                } else {
                    errorMessage = `${e}`;
                }
                dispatch(errorAction(errorMessage));
            }
            onSignError(e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, ledgerCallback, onSignError]);

    return {
        isReady,
        status,
        statusText,
        submitHandler,
    };
}
