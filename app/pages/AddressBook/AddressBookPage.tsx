import React from 'react';

import { Route, Switch } from 'react-router';
import PlusIcon from '@resources/svg/plus.svg';
import UpsertAddress from '~/components/UpsertAddress';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';

import AddressBookList from './AddressBookList';
import AddressBookSelected from './AddressBookSelected';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function AddressBookPage() {
    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Address book</h1>
                <UpsertAddress as={PageLayout.HeaderButton} align="right">
                    <PlusIcon height="20" />
                </UpsertAddress>
            </Header>
            <Master>
                <AddressBookList />
            </Master>
            <Detail>
                <Switch>
                    <Route
                        path={routes.ADDRESSBOOK_SELECTED}
                        render={() => <AddressBookSelected />}
                    />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
