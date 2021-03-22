import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import MultiSignaturePage from './MultiSignaturePage';
import AccountTransactionProposalView from './AccountTransactionProposalView';
import UpdateInstructionProposalView from './UpdateInstructionProposalView';
import CosignTransactionProposalView from './CosignTransactionProposalView';
import SignTransactionProposalView from './SignTransactionProposalView';
import ExportSignedTransactionView from './ExportSignedTransactionView';
import MultiSignatureCreateProposalView from './MultiSignatureCreateProposalView';
import SubmittedProposalView from './SubmittedProposalView';
import ExportKeyView from './ExportKeyView/ExportKeyView';
import CreateAccountTransactionView from './AccountTransactions/CreateAccountTransactionView';
import CosignAccountTransactionProposalView from './CosignAccountTransactionProposalView';

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
                path={routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION}
                component={CreateAccountTransactionView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_COSIGN_ACCOUNT_TRANSACTION}
                component={CosignAccountTransactionProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_COSIGN_TRANSACTION}
                component={CosignTransactionProposalView}
            />
            <Route
                path={
                    routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_ACCOUNT_TRANSACTION
                }
                component={AccountTransactionProposalView}
            />
            <Route
                component={UpdateInstructionProposalView}
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_SELECTED}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                component={MultiSignatureCreateProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_EXPORT_KEY_SELECTED}
                component={ExportKeyView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS}
                component={MultiSignaturePage}
            />
        </Switch>
    );
}
