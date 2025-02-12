import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '~/constants/routes.json';
import MultiSignaturePage from './MultiSignaturePage';
import ProposalView from './ProposalView';
import CosignTransactionProposal from './CosignTransactionProposal';
import MultiSignatureCreateProposal from './MultiSignatureCreateProposal';
import SubmittedProposal from './SubmittedProposal';
import ExportKeyView from './ExportKeyView/ExportKeyView';
import CreateAccountTransactionView from './AccountTransactions/CreateAccountTransactionView';
import AddBaker from './AccountTransactions/AddBaker';
import RemoveBaker from './AccountTransactions/RemoveBaker';
import UpdateBakerStake from './AccountTransactions/UpdateBakerStake';
import UpdateBakerPool from './AccountTransactions/UpdateBakerPool';
import UpdateBakerKeys from './AccountTransactions/UpdateBakerKeys';
import BakerSuspension from './AccountTransactions/BakerSuspension';
import AddDelegation from './AccountTransactions/AddDelegation';
import UpdateDelegation from './AccountTransactions/UpdateDelegation';
import RemoveDelegation from './AccountTransactions/RemoveDelegation';

export default function MultiSignatureRoutes(): JSX.Element {
    return (
        <Switch>
            <Route
                path={routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION}
                component={SubmittedProposal}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
                component={AddBaker}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_REMOVE_BAKER}
                component={RemoveBaker}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
                component={UpdateBakerStake}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL}
                component={UpdateBakerPool}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_KEYS}
                component={UpdateBakerKeys}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_SUSPENSION}
                component={BakerSuspension}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_ADD_DELEGATION}
                component={AddDelegation}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_UPDATE_DELEGATION}
                component={UpdateDelegation}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_REMOVE_DELEGATION}
                component={RemoveDelegation}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION}
                component={CreateAccountTransactionView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_COSIGN_TRANSACTION}
                component={CosignTransactionProposal}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_SELECTED}
                component={ProposalView}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                component={MultiSignatureCreateProposal}
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
