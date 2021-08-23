import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { push } from 'connected-react-router';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { init as initMisc } from './features/MiscSlice';
import { triggerUpdateNotification } from './features/NotificationSlice';

import './styles/app.global.scss';

const store = configuredStore();

initMisc(store.dispatch);
window.addListener.openRoute((_, route: string) => {
    store.dispatch(push(route));
});
window.addListener.logFromMain((_, ...args: any[]) => console.log(...args));

window.autoUpdate.onUpdateAvailable(() => {
    store.dispatch(triggerUpdateNotification());
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
