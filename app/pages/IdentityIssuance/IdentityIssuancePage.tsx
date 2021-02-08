import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../../constants/routes.json';
import PickProvider from './PickProvider';
import PickName from './PickName';
import GeneratePage from './GeneratePage';
import FinalPage from './FinalPage';
import MessageModal from '../../components/MessageModal';
import { IdentityProvider } from '../../utils/types';

/**
 * The Last route is the default (because it has no path)
 */
export default function IdentityIssuancePage(): JSX.Element {
    const dispatch = useDispatch();

    const [provider, setProvider] = useState<IdentityProvider | undefined>();
    const [initialAccountName, setInitialAccountName] = useState<string>('');
    const [identityName, setIdentityName] = useState<string>('');

    const [openModal, setOpenModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalButtonText, setModalButtonText] = useState<string>('');

    function activateModal(
        message: string,
        buttonText = 'Return to identities'
    ) {
        setModalMessage(message);
        setModalButtonText(buttonText);
        setOpenModal(true);
    }

    return (
        <>
            <MessageModal
                title={modalMessage}
                buttonText={modalButtonText}
                onClose={() => dispatch(push(routes.IDENTITIES))}
                open={openModal}
            />
            <Switch>
                <Route
                    path={routes.IDENTITYISSUANCE_PICKPROVIDER}
                    render={() => (
                        <PickProvider
                            setProvider={setProvider}
                            onError={activateModal}
                        />
                    )}
                />
                <Route
                    path={routes.IDENTITYISSUANCE_EXTERNAL}
                    render={() => {
                        if (provider) {
                            return (
                                <GeneratePage
                                    identityName={identityName}
                                    accountName={initialAccountName}
                                    provider={provider}
                                    onError={activateModal}
                                />
                            );
                        }
                        throw new Error(
                            'Unexpected missing identity Provider!'
                        );
                    }}
                />
                <Route
                    path={routes.IDENTITYISSUANCE_FINAL}
                    render={() => (
                        <FinalPage
                            identityName={identityName}
                            accountName={initialAccountName}
                        />
                    )}
                />
                <Route
                    render={() => (
                        <PickName
                            setIdentityName={setIdentityName}
                            setAccountName={setInitialAccountName}
                        />
                    )}
                />
            </Switch>
        </>
    );
}
