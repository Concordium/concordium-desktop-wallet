import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../store/store';
import Routes from './Routes';
import Sidebar from './Sidebar';
import MainLayout from '../cross-app-components/MainLayout';

type Props = {
    store: Store;
    history: History;
};

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Sidebar />
            <MainLayout>
                <Routes />
            </MainLayout>
        </ConnectedRouter>
    </Provider>
);

export default hot(Root);
