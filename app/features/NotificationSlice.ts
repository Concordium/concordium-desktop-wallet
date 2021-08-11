import { createSlice, PayloadAction } from '@reduxjs/toolkit';

enum NotificationLevel {
    Info,
    Warning,
    Error,
    Update,
}

type Notification =
    | { level: NotificationLevel.Update }
    | {
          level: Exclude<NotificationLevel, NotificationLevel.Update>;
          message: string;
          autoRemoveSeconds?: number;
      };

interface NotificationSliceState {
    notifications: Notification[];
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
    },
});

export default notificationSlice.reducer;

export const { pushNotification } = notificationSlice.actions;
