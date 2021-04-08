import React from 'react';

import { Route, Switch } from 'react-router';
import PlusIcon from '@resources/svg/plus.svg';
import UpsertAddress from '~/components/UpsertAddress';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout/MasterDetailPageLayout';

import AddressBookList from './AddressBookList';
import AddressBookSelected from './AddressBookSelected';

export default function AddressBookPage() {
    return (
        <MasterDetailPageLayout>
            <MasterDetailPageLayout.Header>
                <h1>Address Book</h1>
                <UpsertAddress as={PageLayout.HeaderButton} align="right">
                    <PlusIcon height="20" />
                </UpsertAddress>
            </MasterDetailPageLayout.Header>
            <MasterDetailPageLayout.Master>
                <AddressBookList />
            </MasterDetailPageLayout.Master>
            <MasterDetailPageLayout.Detail>
                <Switch>
                    <Route
                        path={routes.ADDRESSBOOK_SELECTED}
                        render={() => <AddressBookSelected />}
                    />
                </Switch>
            </MasterDetailPageLayout.Detail>
        </MasterDetailPageLayout>
    );
}
