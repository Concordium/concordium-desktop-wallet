import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum NotificationLevel {
    Info,
    Error,
    Update,
}

interface UpdateNotification {
    level: NotificationLevel.Update;
}

export interface Notification {
    level: Exclude<NotificationLevel, NotificationLevel.Update>;
    message: string;
    autoRemoveSeconds?: number;
}

interface NotificationSliceState {
    notifications: (UpdateNotification | Notification)[];
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
    } as NotificationSliceState,
    reducers: {
        pushNotification(state, input: PayloadAction<Notification>) {
            state.notifications.push(input.payload);
        },
        triggerUpdateNotification(state) {
            state.notifications.push({ level: NotificationLevel.Update });
        },
    },
});

export default notificationSlice.reducer;

export const { pushNotification } = notificationSlice.actions;
