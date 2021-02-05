import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Grid } from 'semantic-ui-react';
import { Store } from '../store';
import Routes from './Routes';
import SideBar from './Sidebar';
import Header from './Header';

type Props = {
    store: Store;
    history: History;
};

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Grid columns="equal">
                <Grid.Column width={3}>
                    <SideBar />
                </Grid.Column>
                <Grid.Column>
                    <Header />
                    <Routes />
                </Grid.Column>
                <Grid.Column width={1} />
            </Grid>
        </ConnectedRouter>
    </Provider>
);

export default hot(Root);
