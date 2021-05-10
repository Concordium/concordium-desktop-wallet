import React from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { FormProvider, useForm } from 'react-hook-form';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import { AccountForm } from './types';
import SingleColumnRouter from './SingleColumnRouter';
import SplitViewRouter from './SplitViewRouter';

function nextLocation(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL:
        case routes.GENERATE_CREDENTIAL_PICKIDENTITY:
            return routes.GENERATE_CREDENTIAL_PICKACCOUNT;
        case routes.GENERATE_CREDENTIAL_PICKACCOUNT:
        case routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES:
            return routes.GENERATE_CREDENTIAL_SIGN;
        case routes.GENERATE_CREDENTIAL_SIGN:
            return routes.GENERATE_CREDENTIAL_EXPORT;
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return routes.MULTISIGTRANSACTIONS;
        default:
            throw new Error('unknown location');
    }
}

/**
 * Controls the flow of generating a credential. Contains the logic of the left
 * column, where the parameters are displayed, and the address is entered.
 */
export default function GenerateCredential(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const form = useForm<AccountForm>({
        mode: 'onChange',
        shouldUnregister: false,
    });

    const nextPage = () => {
        dispatch(push(nextLocation(location)));
    };

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Generate Account Credentials</h1>
            </PageLayout.Header>
            <PageLayout.Container
                closeRoute={routes.MULTISIGTRANSACTIONS_EXPORT_KEY}
            >
                <FormProvider {...form}>
                    <Switch>
                        <Route
                            path={routes.GENERATE_CREDENTIAL_EXPORT}
                            render={(props) => (
                                <SingleColumnRouter
                                    {...props}
                                    onNext={nextPage}
                                />
                            )}
                        />
                        <Route
                            render={(props) => (
                                <SplitViewRouter {...props} onNext={nextPage} />
                            )}
                        />
                    </Switch>
                </FormProvider>
            </PageLayout.Container>
        </PageLayout>
    );
}
