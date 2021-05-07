import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
// import ExportCredential from '../ExportCredential';

function getHeader(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'Export your credentials';
        default:
            return '';
    }
}

function getDescription(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'The last step is to export and send your credentials to the proposing owner of the account. They will then be able propose you as a new owner of the account.';
        default:
            return '';
    }
}

interface Props extends RouteComponentProps {
    onNext(): void;
}

export default function SingleColumnRouter({
    onNext,
    location,
}: Props): JSX.Element {
    return (
        <div>
            <h2>{getHeader(location.pathname)}</h2>
            <p>{getDescription(location.pathname)}</p>
            <Switch>
                <Route>{/* <ExportCredential /> */}</Route>
            </Switch>
            <Button onClick={onNext}>Finish</Button>
        </div>
    );
}
