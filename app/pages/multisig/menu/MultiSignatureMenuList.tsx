import React from 'react';
import ButtonNavLink from '../../../components/ButtonNavLink';
import routes from '../../../constants/routes.json';

import styles from './MultiSignatureMenu.module.scss';

/**
 * A component that displays the list of menu items available for the multi signature
 * transaction functionality.
 */
export default function MultiSignatureMenuList() {
    return (
        <>
            <ButtonNavLink
                to={routes.MULTISIGTRANSACTIONS}
                className={styles.link}
            >
                Make new proposal
            </ButtonNavLink>
            <ButtonNavLink
                to={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING}
                className={styles.link}
            >
                Your proposed transactions
            </ButtonNavLink>
            <ButtonNavLink
                to={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION}
                className={styles.link}
            >
                Sign a transaction
            </ButtonNavLink>
            <ButtonNavLink
                to={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                className={styles.link}
            >
                Export public-key
            </ButtonNavLink>
        </>
    );
}
