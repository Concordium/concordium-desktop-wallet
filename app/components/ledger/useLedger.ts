import { useEffect, useCallback, useReducer, Dispatch } from 'react';

import { singletonHook } from 'react-singleton-hook';
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
    instanceOfTransportStatusError,
    LedgerSubmitHandler,
    LedgerCallback,
} from './util';
import { instanceOfClosedWhileSendingError } from '~/features/ledger/ClosedWhileSendingError';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

const { CONNECTED, ERROR, OPEN_APP, AWAITING_USER_INPUT } = LedgerStatusType;

export enum LedgerSubscriptionAction {
    CONNECTED_SUBSCRIPTION,
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
    const [{ status, client, text }, dispatch] = useReducer(
        ledgerReducer,
        getInitialState()
    );

    useEffect(() => {
        window.ipcRenderer.on(
            'ledger',
            (_event, action: LedgerSubscriptionAction, deviceName: string) => {
                switch (action) {
                    case LedgerSubscriptionAction.ERROR_SUBSCRIPTION:
                        dispatch(errorAction());
                        return;
                    case LedgerSubscriptionAction.PENDING:
                        dispatch(pendingAction(OPEN_APP, deviceName));
                        return;
                    case LedgerSubscriptionAction.RESET:
                        dispatch(resetAction());
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
            window.ipcRenderer.removeAllListeners('ledger');
        };
    }, []);

    useEffect(() => {
        // TODO I am uncertain if we need to do this or not.
        return function cleanup() {
            dispatch(resetAction());
        };
    }, []);

    return {
        isReady: status === CONNECTED || (status === ERROR && Boolean(client)),
        status,
        statusText: text,
        dispatch,
        client,
    };
}

const init = () => {
    const { status, client, text } = getInitialState();
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
    }, [ledgerCallback, onSignError]);

    return {
        isReady,
        status,
        statusText,
        submitHandler,
    };
}
