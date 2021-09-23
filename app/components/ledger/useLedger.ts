import { useEffect, useCallback, useReducer, Dispatch, useState } from 'react';

import { singletonHook } from 'react-singleton-hook';
import getErrorDescription from '~/features/ledger/ErrorCodes';
import ledgerReducer, {
    cleanupAction,
    connectedAction,
    errorAction,
    finishedAction,
    getInitialState,
    pendingAction,
    loadingAction,
    disconnectAction,
    outdatedAction,
    setStatusTextAction,
} from './ledgerReducer';
import { LedgerStatusType, LedgerSubmitHandler, LedgerCallback } from './util';
import { instanceOfClosedWhileSendingError } from '~/features/ledger/ClosedWhileSendingError';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { noOp } from '~/utils/basicHelpers';
import { instanceOfTransportStatusError } from '~/features/ledger/TransportStatusError';
import {
    instanceOfTransportError,
    isInvalidChannelError,
} from '~/features/ledger/TransportError';

const { CONNECTED, ERROR, OPEN_APP, AWAITING_USER_INPUT } = LedgerStatusType;

export enum LedgerSubscriptionAction {
    CONNECTED_SUBSCRIPTION,
    OUTDATED,
    PENDING,
    RESET,
    ERROR_SUBSCRIPTION,
}

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

    useEffect(() => {
        if (status !== LedgerStatusType.LOADING) {
            return noOp;
        }

        const t = setTimeout(() => dispatch(disconnectAction()), 5000); // If 5 seconds pass, it's safe to assume that the ledger has been disconnected.
        return () => clearTimeout(t);
    }, [status]);

    const [subscribed, setSubscribed] = useState<boolean>();

    useEffect(() => {
        window.addListener.ledgerChannel(
            (action: LedgerSubscriptionAction, deviceName: string) => {
                switch (action) {
                    case LedgerSubscriptionAction.ERROR_SUBSCRIPTION:
                        dispatch(errorAction());
                        return;
                    case LedgerSubscriptionAction.PENDING:
                        dispatch(pendingAction(OPEN_APP, deviceName));
                        return;
                    case LedgerSubscriptionAction.OUTDATED:
                        dispatch(outdatedAction(deviceName));
                        return;
                    case LedgerSubscriptionAction.RESET:
                        dispatch(loadingAction());
                        return;
                    case LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION:
                        dispatch(
                            connectedAction(
                                deviceName,
                                new ConcordiumLedgerClient()
                            )
                        );
                        return;
                    default:
                        throw new Error(`Received an unknown action ${action}`);
                }
            }
        );
        return () => {
            window.removeAllListeners(ledgerIpcCommands.listenChannel);
        };
    }, []);

    useEffect(() => {
        if (!subscribed) {
            window.ledger
                .subscribe()
                .then(() => setSubscribed(true))
                .catch(() => {});
        }
    }, [subscribed]);

    return {
        isReady: (status === CONNECTED || status === ERROR) && Boolean(client),
        status,
        statusText: text,
        dispatch,
        client,
    };
}

const init = () => {
    const { status, text, client } = getInitialState();
    return {
        isReady: false,
        status,
        statusText: text,
        dispatch: () => {},
        client,
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
                window.ledger.closeTransport();
                dispatch(cleanupAction());
            }
        };
    }, [client, dispatch]);

    const submitHandler: LedgerSubmitHandler = useCallback(async () => {
        dispatch(pendingAction(AWAITING_USER_INPUT));

        try {
            if (client) {
                await ledgerCallback(client, (t) =>
                    dispatch(setStatusTextAction(t))
                );
            }
            dispatch(finishedAction());
        } catch (e) {
            if (instanceOfClosedWhileSendingError(e)) {
                dispatch(finishedAction());
            } else if (
                instanceOfTransportError(e) &&
                isInvalidChannelError(e)
            ) {
                await window.ledger.resetTransport();
                const errorMessage =
                    'Invalid channel. Please close any other application attempting to connect to the Ledger and try again.';
                dispatch(errorAction(errorMessage));
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
