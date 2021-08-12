import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { push } from 'connected-react-router';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { init as initMisc } from './features/MiscSlice';

import './styles/app.global.scss';

const store = configuredStore();

initMisc(store.dispatch);
window.addListener.openRoute((_, route: string) => {
    window.log.info(`Routed to${route}`);
    store.dispatch(push(route));
});

window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
    window.log.error('Uncaught rejection: ', {
        error: promiseRejectionEvent.reason.toString(),
    });
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
