import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
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
import styles from './GenesisAccount.module.scss';

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
        <Form<FileInputForm>
            className={styles.fileForm}
            onSubmit={handleSubmit}
        >
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

interface PickSettingsProps {
    onSubmit(name: string, balance: string, address?: string): void;
}

interface PickSettingsForm {
    name: string;
    balance: string;
    address: string | undefined;
}

function PickSettings({ onSubmit }: PickSettingsProps) {
    const [existingAccount, setExistingAccount] = useState(false);

    function setSettings(values: PickSettingsForm) {
        const { name, balance, address } = values;
        onSubmit(name, balance, address);
    }

    return (
        <Form onSubmit={setSettings}>
            <Form.Input
                className={styles.settingInput}
                name="name"
                placeholder="Account name"
                rules={{ required: 'name is required' }}
            />
            <div className={styles.settingInput}>
                <Form.Checkbox
                    name="existingAccount"
                    onChange={(e) => setExistingAccount(e.target.checked)}
                >
                    Existing Account:
                </Form.Checkbox>
                {existingAccount ? (
                    <Form.Input
                        name="address"
                        placeholder="Address"
                        rules={{ required: 'address is required' }}
                    />
                ) : (
                    <Form.Input
                        className={styles.settingInput}
                        name="balance"
                        type="number"
                        placeholder="Input Balance as GTU"
                        rules={{ required: 'balance is required' }}
                    />
                )}
            </div>
            <Form.Submit className={styles.settingInput}>Continue</Form.Submit>
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
            return 'Settings';
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
    const [accountAddress, setAddress] = useState<string | undefined>();
    const [balance, setBalance] = useState<string>('');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        if (accountAddress) {
            accountDetails.address = accountAddress;
        }

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
        return (
            <div className={styles.genesisContainer}>
                <SimpleLedger ledgerCall={createAccount} />
            </div>
        );
    }

    function Current() {
        switch (currentLocation) {
            case Locations.Name:
                return (
                    <PickSettings
                        onSubmit={(
                            name: string,
                            newBalance: string,
                            address?: string
                        ) => {
                            setAccountName(name);
                            setBalance(newBalance);
                            setAddress(address);
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
            <PageLayout.Container className={styles.genesisContainer}>
                <h2>{subtitle(currentLocation)}</h2>
                <Current />
            </PageLayout.Container>
        </PageLayout>
    );
}
