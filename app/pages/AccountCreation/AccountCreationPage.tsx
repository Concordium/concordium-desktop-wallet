import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PickName from './PickName';
import PickIdentity from './PickIdentity';
import PickAttributes from './PickAttributes';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';
import { Identity } from '../../utils/types';
import PageHeader from '../../components/PageHeader';

function getSubtitle(location: string) {
    switch (location) {
        case routes.ACCOUNTCREATION_PICKIDENTITY:
            return 'Choose an identity';
        case routes.ACCOUNTCREATION_GENERATE:
            return 'Creating a new account';
        case routes.ACCOUNTCREATION_PICKATTRIBUTES:
            return 'Revealing Attributes';
        case routes.ACCOUNTCREATION_FINAL:
            return 'Your account';
        default:
            return 'Choose your account name';
    }
}

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
export default function AccountCreationPage(): JSX.Element {
    const [accountName, setAccountName] = useState('');
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [chosenAttributes, setChosenAttributes] = useState<string[]>([]);

    return (
        <>
            <PageHeader>
                <h1> New Account | {getSubtitle(useLocation().pathname)}</h1>
            </PageHeader>
            <Switch>
                <Route
                    path={routes.ACCOUNTCREATION_PICKIDENTITY}
                    render={() => <PickIdentity setIdentity={setIdentity} />}
                />
                <Route
                    path={routes.ACCOUNTCREATION_FINAL}
                    render={() => <FinalPage accountName={accountName} />}
                />
                <Route
                    path={routes.ACCOUNTCREATION_GENERATE}
                    render={() => {
                        if (identity) {
                            return (
                                <GeneratePage
                                    accountName={accountName}
                                    attributes={chosenAttributes}
                                    identity={identity}
                                />
                            );
                        }
                        throw new Error('Unexpected missing identity!');
                    }}
                />
                <Route
                    path={routes.ACCOUNTCREATION_PICKATTRIBUTES}
                    render={() => {
                        if (identity) {
                            return (
                                <PickAttributes
                                    identity={identity}
                                    setChosenAttributes={setChosenAttributes}
                                />
                            );
                        }
                        throw new Error('Unexpected missing identity!');
                    }}
                />
                <Route
                    render={() => <PickName setAccountName={setAccountName} />}
                />
            </Switch>
        </>
    );
}
