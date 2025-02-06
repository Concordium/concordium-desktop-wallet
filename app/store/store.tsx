import React, { PropsWithChildren } from 'react';
import { configureStore, getDefaultMiddleware, Action } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
import { Provider } from 'react-redux';

/* eslint-disable import/no-cycle */
import createRootReducer from './rootReducer';
import { notificationsMiddleware } from '~/features/NotificationSlice';
/* eslint-enable import/no-cycle */

export const history = createBrowserHistory({
    basename: window.location.pathname,
});
const rootReducer = createRootReducer(history);
export type RootState = ReturnType<typeof rootReducer>;

const router = routerMiddleware(history);
const middleware = [...getDefaultMiddleware(), router, notificationsMiddleware];

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
    process.env.NODE_ENV || ''
);

if (shouldIncludeLogger) {
    const logger = createLogger({
        level: 'info',
        collapsed: true,
    });
    middleware.push(logger);
}

export const configuredStore = (initialState?: RootState) => {
    // Create Store
    const store = configureStore({
        reducer: rootReducer,
        middleware,
        preloadedState: initialState,
    });

    if (process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept('./rootReducer', () =>
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            store.replaceReducer(require('./rootReducer').default)
        );
    }
    return store;
};

export function StoreWrapper({
    children,
    ...initialState
}: PropsWithChildren<Partial<RootState>>) {
    const defaultState = rootReducer(undefined, { type: null });
    const store = configuredStore({ ...defaultState, ...initialState });

    return <Provider store={store}>{children}</Provider>;
}

export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
