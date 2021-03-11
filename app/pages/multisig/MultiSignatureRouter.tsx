import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import MultiSignaturePage from './MultiSignaturePage';
import ProposalView from './ProposalView';
import CosignTransactionProposalView from './CosignTransactionProposalView';
import SignTransactionProposalView from './SignTransactionProposalView';
import ExportSignedTransactionView from './ExportSignedTransactionView';
import MultiSignatureCreateProposalView from './MultiSignatureCreateProposalView';
import SubmittedProposalView from './SubmittedProposalView';
import ExportKeyView from './ExportKeyView/ExportKeyView';

export default function MultiSignatureRoutes(): JSX.Element {
    return (
        <Switch>
            <Route
                path={routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION}
                component={SubmittedProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION}
                component={ExportSignedTransactionView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION}
                component={SignTransactionProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_COSIGN_TRANSACTION}
                component={CosignTransactionProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_SELECTED}
                component={ProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                component={MultiSignatureCreateProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
                component={ExportKeyView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS}
                component={MultiSignaturePage}
            />
        </Switch>
    );
}
