import React from 'react';
import { Route, Switch } from 'react-router';
import MultiSignatureProposalPage from './MultiSignatureProposalPage';

interface Location {
    state;
}

interface Props {
    location: Location;
}

export default function MultiSignatureProposalPageRouter(props: Props) {
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
