import { useEffect, useCallback, useReducer, Dispatch, useState } from 'react';

import { singletonHook } from 'react-singleton-hook';
import getErrorDescription from '~/features/ledger/ErrorCodes';
import ledgerReducer, {
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
import { instanceOfLedgerTimeoutError } from '~/features/ledger/LedgerTimeoutError';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { noOp } from '~/utils/basicHelpers';
import { instanceOfTransportStatusError } from '~/features/ledger/TransportStatusError';
import {
    instanceOfTransportError,
    isInvalidChannelError,
} from '~/features/ledger/TransportError';

const { CONNECTED, OPEN_APP, AWAITING_USER_INPUT } = LedgerStatusType;

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
                .catch((e: unknown) => {
                    // Surface subscription errors so the user knows why the
                    // device is not detected (driver issues, permissions, etc.)
                    dispatch(
                        errorAction(
                            `Failed to subscribe to Ledger device: ${e}`
                        )
                    );
                });
        }
    }, [subscribed]);

    return {
        // Only CONNECTED (not ERROR) means the device is usable. Allowing
        // ERROR here was bug #3: the submit handler could fire on a broken transport.
        isReady: status === CONNECTED && Boolean(client),
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

    // No useEffect cleanup here — transport and singleton state are left intact
    // so the next signing screen finds the device ready immediately.
    // The main-process subscription observer handles all state transitions via
    // USB events and polling; no manual cleanup is needed from the renderer.

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
                // Device was unplugged mid-operation — treat as graceful finish;
                // the observer will emit a RESET/DISCONNECT event separately.
                dispatch(finishedAction());
            } else if (
                instanceOfTransportError(e) &&
                isInvalidChannelError(e)
            ) {
                await window.ledger.resetTransport();
                const errorMessage =
                    'Invalid channel. Please close any other application attempting to connect to the Ledger and try again.';
                dispatch(errorAction(errorMessage));
            } else if (instanceOfLedgerTimeoutError(e)) {
                // Device stopped responding — surface the timeout message directly.
                dispatch(errorAction((e as Error).message));
            } else if (
                (e as Error).name === 'DisconnectedDevice' ||
                (e as Error).name === 'DisconnectedDeviceDuringOperation'
            ) {
                // Device was unplugged or the app was exited mid-signing.
                // Treat gracefully like ClosedWhileSendingError — the subscription
                // observer will emit RESET/DISCONNECT to update status separately.
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
