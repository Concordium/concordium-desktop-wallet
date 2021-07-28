import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { push } from 'connected-react-router';
import { ipcRenderer } from './global';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { openRoute } from '~/constants/ipcRendererCommands.json';
import { init as initMisc } from './features/MiscSlice';

import './styles/app.global.scss';

const store = configuredStore();

initMisc(store.dispatch);
ipcRenderer.on(openRoute, (_, route: string) => {
    store.dispatch(push(route));
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
