import { Action, Reducer } from 'redux';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { LedgerStatusType } from './util';

interface LedgerReducerState {
    text: string;
    status: LedgerStatusType;
    deviceName?: string;
    client?: ConcordiumLedgerClient;
}

enum LedgerActionType {
    PENDING,
    CONNECTED,
    ERROR,
    RESET,
    SET_STATUS_TEXT,
    FINISHED,
}

interface PendingAction extends Action<LedgerActionType.PENDING> {
    status: LedgerStatusType;
    deviceName?: string;
}

export const pendingAction = (
    status: LedgerStatusType,
    deviceName?: string
): PendingAction => ({
    type: LedgerActionType.PENDING,
    status,
    deviceName,
});

interface ConnectedAction extends Action<LedgerActionType.CONNECTED> {
    deviceName: string;
    client: ConcordiumLedgerClient;
}

export const connectedAction = (
    deviceName: string,
    client: ConcordiumLedgerClient
): ConnectedAction => ({
    type: LedgerActionType.CONNECTED,
    deviceName,
    client,
});

type ResetAction = Action<LedgerActionType.RESET>;

export const resetAction = (): ResetAction => ({
    type: LedgerActionType.RESET,
});

interface ErrorAction extends Action<LedgerActionType.ERROR> {
    message?: string;
}

export const errorAction = (message?: string): ErrorAction => ({
    type: LedgerActionType.ERROR,
    message,
});

interface SetStatusTextAction extends Action<LedgerActionType.SET_STATUS_TEXT> {
    text: string;
}

export const setStatusTextAction = (text: string): SetStatusTextAction => ({
    type: LedgerActionType.SET_STATUS_TEXT,
    text,
});

type FinishedAction = Action<LedgerActionType.FINISHED>;

export const finishedAction = (): FinishedAction => ({
    type: LedgerActionType.FINISHED,
});

type LedgerAction =
    | PendingAction
    | ConnectedAction
    | ResetAction
    | ErrorAction
    | SetStatusTextAction
    | FinishedAction;

function getStatusMessage(
    status: LedgerStatusType,
    deviceName?: string
): string {
    switch (status) {
        case LedgerStatusType.LOADING:
            return 'Waiting for device';
        case LedgerStatusType.AWAITING_USER_INPUT:
            return 'Waiting for user to finish the process on device';
        case LedgerStatusType.ERROR:
            return 'Unable to connect to device';
        case LedgerStatusType.CONNECTED:
            return `${deviceName} is ready!`;
        case LedgerStatusType.OPEN_APP:
            return `Please open the Concordium application on your ${deviceName}`;
        default:
            throw new Error('Unsupported status');
    }
}

export const getInitialState = (): LedgerReducerState => ({
    status: LedgerStatusType.LOADING,
    text: getStatusMessage(LedgerStatusType.LOADING),
});

const ledgerReducer: Reducer<LedgerReducerState, LedgerAction> = (
    s = getInitialState(),
    a
) => {
    const deviceName =
        (a as PendingAction | ConnectedAction).deviceName || s.deviceName;

    switch (a.type) {
        case LedgerActionType.PENDING:
            return {
                ...s,
                status: a.status,
                text: getStatusMessage(a.status, deviceName),
                deviceName,
            };
        case LedgerActionType.CONNECTED:
            return {
                status: LedgerStatusType.CONNECTED,
                deviceName,
                client: a.client,
                text: getStatusMessage(LedgerStatusType.CONNECTED, deviceName),
            };
        case LedgerActionType.RESET:
            return getInitialState();
        case LedgerActionType.SET_STATUS_TEXT:
            return { ...s, text: a.text };
        case LedgerActionType.ERROR:
            return {
                ...s,
                status: LedgerStatusType.ERROR,
                text: a.message || getStatusMessage(LedgerStatusType.ERROR),
            };
        case LedgerActionType.FINISHED:
            return { ...s, status: LedgerStatusType.CONNECTED };
        default:
            return s;
    }
};

export default ledgerReducer;
