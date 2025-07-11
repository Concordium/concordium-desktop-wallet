import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { foundationTransactionsEnabledSelector } from '~/features/SettingsSlice';
import ButtonNavLink from '~/components/ButtonNavLink';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import routes from '~/constants/routes.json';

import BrowseTransactionFile from '../menu/BrowseTransactionFile';
import ExportKeyList from '../menu/ExportKeyList';
import ImportProposal from '../menu/ImportProposal';
import ProposalList from '../menu/ProposalList';

import styles from './MultiSignaturePage.module.scss';
import {
    MultiSignatureCreateAccountProposalView,
    MultiSignatureCreateGovernanceProposalView,
} from '../menu/MultiSignatureCreateProposalList';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function MultiSignaturePage() {
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );

    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Multi signature transactions</h1>
            </Header>
            <Master>
                <ButtonNavLink
                    to={routes.MULTISIGTRANSACTIONS}
                    className={styles.link}
                    exact
                >
                    Make new proposal
                </ButtonNavLink>
                {foundationTransactionsEnabled && (
                    <ButtonNavLink
                        to={routes.MULTISIGTRANSACTIONS_GOV}
                        className={styles.link}
                    >
                        Make new governance proposal
                    </ButtonNavLink>
                )}
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
                {foundationTransactionsEnabled && (
                    <ButtonNavLink
                        to={routes.MULTISIGTRANSACTIONS_IMPORT_PROPOSAL}
                        className={styles.link}
                    >
                        Import proposals
                    </ButtonNavLink>
                )}
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
                        component={MultiSignatureCreateAccountProposalView}
                        exact
                    />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS_GOV}
                        component={MultiSignatureCreateGovernanceProposalView}
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
