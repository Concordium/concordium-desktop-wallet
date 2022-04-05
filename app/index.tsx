import React from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { push } from 'connected-react-router';
import { UpdateInfo } from 'electron-updater';

import './styles/libs.global.scss';

import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { init as initMisc } from './features/MiscSlice';
import { triggerUpdateNotification } from './features/NotificationSlice';
import ErrorBoundary from '~/components/ErrorBoundary';

import './styles/app.global.scss';

try {
    const store = configuredStore();

    window.autoUpdate.onError((_, errorMessage: string, error: Error) =>
        window.log.error(errorMessage, { error })
    );

    initMisc(store.dispatch);
    window.addListener.openRoute((_, route: string) => {
        window.log.info(`Routed to${route}`);
        store.dispatch(push(route));
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
    window.addListener.logFromMain((_, ...args: any[]) => console.log(...args));

    window.addEventListener('unhandledrejection', (promiseRejectionEvent) =>
        window.log.error('Uncaught rejection: ', {
            error: promiseRejectionEvent.reason.toString(),
        })
    );

    window.autoUpdate.onUpdateAvailable((_, info: UpdateInfo) => {
        store.dispatch(triggerUpdateNotification(info.version));
    });

    const AppContainer = ReactHotAppContainer;

    document.addEventListener('DOMContentLoaded', () =>
        render(
            <AppContainer>
                <ErrorBoundary>
                    <Root store={store} history={history} />
                </ErrorBoundary>
            </AppContainer>,
            document.getElementById('root')
        )
    );
} catch (error) {
    window.log.error('Error thrown in index.tsx', { error });
}
