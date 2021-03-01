import React from 'react';
import AddressBookList from './AddressBookList';
import AddressBookElementView from './AddressBookElementView';

import PlusIcon from '../../../resources/svg/plus.svg';
import UpsertAddress from '../../components/UpsertAddress';
import PageLayout from '../../components/PageLayout';
import Columns from '../../components/Columns';

import styles from './AddressBookPage.module.scss';

export default function AddressBookPage() {
    return (
        <PageLayout noGutter>
            <PageLayout.Header>
                <h1>Address Book</h1>
                <UpsertAddress as={PageLayout.HeaderButton} align="right">
                    <PlusIcon />
                </UpsertAddress>
            </PageLayout.Header>
            <Columns
                divider
                className={styles.columns}
                columnClassName={styles.column}
                columnScroll
            >
                <Columns.Column>
                    <AddressBookList />
                </Columns.Column>
                <Columns.Column>
                    <AddressBookElementView />
                </Columns.Column>
            </Columns>
        </PageLayout>
    );
}
