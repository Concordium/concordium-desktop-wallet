import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import PickName from './PickName';
import PickIdentity from './PickIdentity';
import PickAttributes from './PickAttributes';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
export default function AccountCreation(): JSX.Element {
    const [accountName, setAccountName] = useState('');
    const [identity, setIdentity] = useState('');
    const [chosenAttributes, setChosenAttributes] = useState([]);

    return (
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
                render={() => (
                    <GeneratePage
                        accountName={accountName}
                        chosenAttributes={chosenAttributes}
                        identity={identity}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTCREATION_PICKATTRIBUTES}
                render={() => (
                    <PickAttributes
                        identity={identity}
                        setChosenAttributes={setChosenAttributes}
                    />
                )}
            />
            <Route
                render={() => <PickName setAccountName={setAccountName} />}
            />
        </Switch>
    );
}
