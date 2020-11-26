import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../store';
import Routes from '../Routes';
import SideBar from '../components/Sidebar';
import Header from '../components/Header';
import styles from '../Main.css';

type Props = {
    store: Store;
    history: History;
};

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <div className={styles.globalDiv}>
                <SideBar />
                <div className={styles.rightSide}>
                    <Header />
                    <Routes />
                </div>
            </div>
        </ConnectedRouter>
    </Provider>
);

export default hot(Root);
