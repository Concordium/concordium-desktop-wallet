import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';

import BgImage from '@resources/images/background.png';
import { Store } from '~/store/store';
import MainLayout from '~/cross-app-components/MainLayout';

import Routes from '../Routes';
import Sidebar from '../Sidebar';
import styles from './Root.module.scss';

type Props = {
    store: Store;
    history: History;
};

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Sidebar />
            <MainLayout
                className={styles.root}
                style={{ backgroundImage: `url(${BgImage})` }}
            >
                <Routes />
            </MainLayout>
        </ConnectedRouter>
    </Provider>
);

export default hot(Root);
