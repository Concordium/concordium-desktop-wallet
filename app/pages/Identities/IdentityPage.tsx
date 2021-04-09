import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PlusIcon from '@resources/svg/plus.svg';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';
import NoIdentities from '~/components/NoIdentities';
import { identitiesSelector } from '~/features/IdentitySlice';
import routes from '~/constants/routes.json';
import styles from './Identities.module.scss';

import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';

export default function IdentityPage() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    const body = useMemo(() => {
        if (identities.length === 0) {
            return <NoIdentities />;
        }

        return (
            <Columns divider columnScroll columnClassName={styles.column}>
                <Columns.Column>
                    <IdentityList />
                </Columns.Column>
                <Columns.Column>
                    <IdentityView />
                </Columns.Column>
            </Columns>
        );
    }, [identities]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Identities</h1>
                <PageLayout.HeaderButton
                    align="right"
                    onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
                >
                    <PlusIcon height="20" />
                </PageLayout.HeaderButton>
            </PageLayout.Header>
            {body}
        </PageLayout>
    );
}
