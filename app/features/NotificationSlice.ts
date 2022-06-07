import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

export enum NotificationLevel {
    Info = 'info',
    Error = 'error',
    ManualUpdate = 'manual-update',
    AutoUpdate = 'auto-update',
    ClosingBakerPool = 'closing-baker-pool',
}

let nextId = 0;

interface NotificationBase {
    id: number;
}

interface UpdateNotification extends NotificationBase {
    level: NotificationLevel.ManualUpdate | NotificationLevel.AutoUpdate;
    version: string;
}

export interface ClosingBakerNotification extends NotificationBase {
    level: NotificationLevel.ClosingBakerPool;
    accountName: string;
}

export interface Notification extends NotificationBase {
    level: Exclude<
        NotificationLevel,
        | NotificationLevel.ManualUpdate
        | NotificationLevel.AutoUpdate
        | NotificationLevel.ClosingBakerPool
    >;
    message: string;
}

interface NotificationSliceState {
    notifications: (
        | UpdateNotification
        | Notification
        | ClosingBakerNotification
    )[];
}

const { actions, reducer } = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
    } as NotificationSliceState,
    reducers: {
        pushNotification(
            state,
            action: PayloadAction<
                Notification | UpdateNotification | ClosingBakerNotification
            >
        ) {
            state.notifications.push({ ...action.payload });
        },
        removeNotification(state, action: PayloadAction<number>) {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
        },
    },
});

export default reducer;

export const { removeNotification } = actions;

export function triggerUpdateNotification(
    dispatch: Dispatch,
    version: string,
    auto: boolean
) {
    dispatch(
        actions.pushNotification({
            level: auto
                ? NotificationLevel.AutoUpdate
                : NotificationLevel.ManualUpdate,
            id: nextId,
            version,
        })
    );

    nextId += 1;
}

export function triggerClosingBakerPoolNotification(
    dispatch: Dispatch,
    accountName: string
) {
    dispatch(
        actions.pushNotification({
            level: NotificationLevel.ClosingBakerPool,
            id: nextId,
            accountName,
        })
    );
    nextId += 1;
}

/**
 * Display notifications of different types.
 *
 * @example
 * const dispatch = useDispatch();
 * pushNotification(dispatch, { NotificationLevel.Info, message: 'Informative message' }, 5);
 *
 * @returns function to close the notification programatically.
 */
export function pushNotification(
    dispatch: Dispatch,
    notification: Omit<Notification, 'id'>,
    autoRemoveSeconds?: number
) {
    const id = nextId;
    dispatch(actions.pushNotification({ ...notification, id }));

    nextId += 1;

    const close = () => dispatch(removeNotification(id));

    if (autoRemoveSeconds) {
        setTimeout(close, autoRemoveSeconds * 1000);
    }

    return close;
}
