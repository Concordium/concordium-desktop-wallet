import React from 'react';
import { Route, Switch } from 'react-router';
import ButtonNavLink from '~/components/ButtonNavLink';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import routes from '~/constants/routes.json';

import BrowseTransactionFile from '../menu/BrowseTransactionFile';
import ExportKeyList from '../menu/ExportKeyList';
import MultiSignatureCreateProposalList from '../menu/MultiSignatureCreateProposalList';
import ImportProposal from '../menu/ImportProposal';
import ProposalList from '../menu/ProposalList';

import styles from './MultiSignaturePage.module.scss';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function MultiSignaturePage() {
    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Multi Signature Transactions</h1>
            </Header>
            <Master>
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
                    to={routes.MULTISIGTRANSACTIONS_IMPORT_PROPOSAL}
                    className={styles.link}
                >
                    Import proposals
                </ButtonNavLink>
                <ButtonNavLink
                    to={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                    className={styles.link}
                >
                    Export a key
                </ButtonNavLink>
            </Master>
            <Detail>
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
                        path={routes.MULTISIGTRANSACTIONS_IMPORT_PROPOSAL}
                        component={ImportProposal}
                    />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                        component={ExportKeyList}
                    />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
