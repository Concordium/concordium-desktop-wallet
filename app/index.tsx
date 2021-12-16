import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { push } from 'connected-react-router';
import { UpdateInfo } from 'electron-updater';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { init as initMisc } from './features/MiscSlice';
import { triggerUpdateNotification } from './features/NotificationSlice';

import './styles/app.global.scss';

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

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById('root')
    )
);
