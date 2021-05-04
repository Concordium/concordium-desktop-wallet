import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '~/constants/routes.json';
import { accountsSelector } from '~/features/AccountSlice';
import { identitiesSelector } from '~/features/IdentitySlice';
import AccountCard from '~/components/AccountCard';
import IdentityCard from '~/components/IdentityCard';
import Button from '~/cross-app-components/Button';

import generalStyles from '../IdentityIssuance.module.scss';
import styles from './FinalPage.module.scss';

interface Props {
    identityName: string;
    accountName: string;
}

export default function IdentityIssuanceFinal({
    identityName,
    accountName,
}: Props): JSX.Element | null {
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);

    const account = accounts.find((acc) => acc.name === accountName);
    const identity = identities.find((id) => id.name === identityName);

    if (account === undefined || identity === undefined) {
        return null;
    }

    return (
        <>
            <h2 className={generalStyles.header}>
                Your request is being finished by the provider
            </h2>
            <p className={generalStyles.textRow}>
                While the identity provider is verifying your identity and
                submitting your initial account, you can see an overview here.
                Once finished by the provider, you can start using both.
            </p>
            <IdentityCard className={styles.card} identity={identity} />
            <AccountCard className={styles.card} account={account} />
            <Button className={styles.button} as={Link} to={routes.IDENTITIES}>
                Finished!
            </Button>
        </>
    );
}
