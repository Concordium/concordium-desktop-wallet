import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

export enum NotificationLevel {
    Info,
    Error,
    Update,
}

let nextId = 0;

interface NotificationBase {
    id: number;
}

interface UpdateNotification extends NotificationBase {
    level: NotificationLevel.Update;
    version: string;
}

export interface Notification extends NotificationBase {
    level: Exclude<NotificationLevel, NotificationLevel.Update>;
    message: string;
}

interface NotificationSliceState {
    notifications: (UpdateNotification | Notification)[];
}

const { actions, reducer } = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
    } as NotificationSliceState,
    reducers: {
        pushNotification(state, action: PayloadAction<Notification>) {
            state.notifications.push({ ...action.payload });
        },
        triggerUpdateNotification(state, action: PayloadAction<string>) {
            state.notifications.push({
                level: NotificationLevel.Update,
                id: nextId,
                version: action.payload,
            });

            nextId += 1;
        },
        removeNotification(state, action: PayloadAction<number>) {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
        },
    },
});

export default reducer;

export const { triggerUpdateNotification, removeNotification } = actions;

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
