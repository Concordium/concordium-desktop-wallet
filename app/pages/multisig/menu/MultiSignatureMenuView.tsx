import React from 'react';
import { Route, Switch } from 'react-router';
import MultiSignatureCreateProposalList from './MultiSignatureCreateProposalList';
import BrowseTransactionFileView from './BrowseTransactionFileView';
import ProposalList from './ProposalList';
import ExportKeyList from './ExportKeyList';
import routes from '../../../constants/routes.json';

export default function MultiSignatureMenuView() {
    return (
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
                component={BrowseTransactionFileView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                component={ExportKeyList}
            />
        </Switch>
    );
}
