import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../../constants/routes.json';
import pickName from './PickName';
import chooseIdentity from './PickIdentity';
import pickAttributes from './PickAttributes';
import generate from './GeneratePage';
import finalPage from './FinalPage';

// The entrance into the flow is the last Route (which should have the parent route), otherwise the flow is controlled by the components themselves
export default function AccountCreation(): JSX.Element {
    const [accountName, setAccountName] = useState('');
    const [identity, setIdentity] = useState('');
    const [chosenAttributes, setChosenAttributes] = useState([]);

    return (
        <Switch>
            <Route
                path={routes.ACCOUNTCREATION_CHOOSEIDENTITY}
                component={() => chooseIdentity(setIdentity)}
            />
            <Route
                path={routes.ACCOUNTCREATION_FINAL}
                component={() => finalPage(accountName)}
            />
            <Route
                path={routes.ACCOUNTCREATION_GENERATE}
                component={() =>
                    generate(accountName, chosenAttributes, identity)
                }
            />
            <Route
                path={routes.ACCOUNTCREATION_PICK_ATTRIBUTES}
                component={() => pickAttributes(identity, setChosenAttributes)}
            />
            <Route
                path={routes.ACCOUNTCREATION}
                component={() => pickName(setAccountName)}
            />
        </Switch>
    );
}
