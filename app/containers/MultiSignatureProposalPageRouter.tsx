import React from 'react';
import { Route, Switch } from 'react-router';
import MultiSignatureProposalPage from './MultiSignatureProposalPage';
import routes from '../constants/routes.json';
import ProposalView from '../components/multisig/ProposalView';

export default function MultiSignatureProposalPageRouter(props) {
    return (
        <Switch>
            <Route
                render={() => (
                    <MultiSignatureProposalPage type={props.location.state} />
                )}
            />
        </Switch>
    );
}
