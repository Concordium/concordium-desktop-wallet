import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PickName from '../AccountCreation/PickName';
import PageLayout from '~/components/PageLayout';
import Form from '~/components/Form';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { createGenesisAccount } from '~/utils/rustInterface';
import { importAccount } from '~/features/AccountSlice';
import { insertNewCredential } from '~/features/CredentialSlice';
import { Account, AccountStatus, IdentityStatus } from '~/utils/types';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { saveFile } from '~/utils/FileHelper';
import routes from '~/constants/routes.json';
import { toMicroUnits } from '~/utils/gtu';
import {
    identitiesSelector,
    importIdentities,
    loadIdentities,
} from '~/features/IdentitySlice';
import { getNextCredentialNumber } from '~/database/CredentialDao';

interface FileInputForm {
    file: FileInputValue;
}

function inputFile(saveFileContent: (file: string) => void) {
    async function handleSubmit(values: FileInputForm) {
        if (values !== null) {
            const { file } = values;
            if (file) {
                const content = Buffer.from(
                    await file[0].arrayBuffer()
                ).toString();
                saveFileContent(content);
            }
        }
    }

    return (
        <Form<FileInputForm> onSubmit={handleSubmit}>
            <Form.File
                name="file"
                placeholder="Drag and drop file here"
                buttonTitle="or browse to file"
                rules={{
                    required: 'File is required',
                }}
            />
            <Form.Submit>Submit</Form.Submit>
        </Form>
    );
}

enum Locations {
    Name,
    Context,
    Create,
}

const subtitle = (currentLocation: Locations) => {
    switch (currentLocation) {
        case Locations.Name:
            return 'Pick Name';
        case Locations.Context:
            return 'Input Context file';
        case Locations.Create:
            return 'Export keys from ledger';
        default:
            throw new Error('unknown location');
    }
};
const defaultId = 0;

// Component to create genesis account;
export default function GenesisAccount(): JSX.Element {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const [currentLocation, setLocation] = useState<Locations>(Locations.Name);
    const [accountName, setAccountName] = useState('');
    const [context, setContext] = useState<string | undefined>();
    const [balance] = useState<string>('100');
    const [identityId, setIdentityId] = useState<number>(defaultId);

    const createdAt = '202104';

    useEffect(() => {
        if (identities.length === 0) {
            const identityObject = {
                v: 0,
                value: {
                    attributeList: {
                        chosenAttributes: {},
                        createdAt,
                        validTo: '202204', // Should be 1 year after createdAt?
                    },
                },
            };

            const identity = {
                name: 'Genesis',
                id: defaultId,
                identityObject: JSON.stringify(identityObject),
                status: IdentityStatus.Local,
                detail: '',
                codeUri: '',
                identityProvider: '{}',
                randomness: '',
            };
            importIdentities(identity);
            loadIdentities(dispatch);
        } else {
            setIdentityId(identities[0].id);
        }
    }, []);

    async function createAccount(
        ledger: ConcordiumLedgerClient,
        displayMessage: (message: string) => void
    ) {
        const credentialNumber = await getNextCredentialNumber(identityId);
        if (!context) {
            throw new Error('missing context');
        }

        const { ipInfo, arInfo, global } = JSON.parse(context);

        const accountDetails = await createGenesisAccount(
            ledger,
            identityId,
            credentialNumber,
            ipInfo,
            arInfo,
            global,
            createdAt,
            displayMessage
        );

        const success = await saveFile(
            JSON.stringify({
                ...accountDetails,
                balance: toMicroUnits(balance).toString(),
            }),
            'Save account details'
        );
        if (success) {
            const account: Account = {
                status: AccountStatus.Confirmed,
                address: accountDetails.address,
                name: accountName,
                identityId,
                maxTransactionId: 0,
                isInitial: false,
            };

            importAccount(account);
            Object.entries(
                accountDetails.credentials.value
            ).forEach(([index, { contents }]) =>
                insertNewCredential(
                    dispatch,
                    accountDetails.address,
                    credentialNumber,
                    identityId,
                    parseInt(index, 10),
                    contents
                )
            );
            dispatch(push(routes.ACCOUNTS));
        }
    }

    function Create() {
        return <SimpleLedger ledgerCall={createAccount} />;
    }

    function Current() {
        switch (currentLocation) {
            case Locations.Name:
                return (
                    <PickName
                        submitName={(name: string) => {
                            setAccountName(name);
                            setLocation(Locations.Context);
                        }}
                    />
                );
            case Locations.Context:
                return inputFile((file: string) => {
                    setContext(file);
                    setLocation(Locations.Create);
                });
            case Locations.Create:
                return <Create />;
            default:
                throw new Error('unknown location');
        }
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1> New Account | Genesis Account </h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <h2>{subtitle(currentLocation)}</h2>
                <Current />
            </PageLayout.Container>
        </PageLayout>
    );
}
