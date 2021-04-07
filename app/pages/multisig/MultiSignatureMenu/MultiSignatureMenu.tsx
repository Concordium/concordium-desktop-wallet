import React from 'react';
import { Route, Switch } from 'react-router';
import ButtonNavLink from '~/components/ButtonNavLink';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';

import BrowseTransactionFile from './BrowseTransactionFile/BrowseTransactionFile';
import ExportKeyList from './ExportKeyList';
import MultiSignatureCreateProposalList from './MultiSignatureCreateProposalList';
import ProposalList from './ProposalList';
import styles from './MultiSignatureMenu.module.scss';

export default function MultiSignatureMenu(): JSX.Element {
    return (
        <Columns columnScroll divider columnClassName={styles.column}>
            <Columns.Column verticalPadding>
                <ButtonNavLink
                    to={routes.MULTISIGTRANSACTIONS}
                    className={styles.link}
                    exact
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
                    to={routes.MULTISIGTRANSACTIONS_BROWSE_TRANSACTION}
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
            </Columns.Column>
            <Columns.Column verticalPadding>
                <Switch>
                    <Route
                        path={routes.MULTISIGTRANSACTIONS}
                        component={MultiSignatureCreateProposalList}
                        exact
                    />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING}
                        component={ProposalList}
                    />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS_BROWSE_TRANSACTION}
                        component={BrowseTransactionFile}
                    />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                        component={ExportKeyList}
                    />
                </Switch>
            </Columns.Column>
        </Columns>
    );
}
