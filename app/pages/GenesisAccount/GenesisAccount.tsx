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
import {
    Account,
    AccountStatus,
    IdentityStatus,
    CredentialDeploymentValues,
} from '~/utils/types';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { saveFile } from '~/utils/FileHelper';
import routes from '~/constants/routes.json';
import {
    identitiesSelector,
    importIdentities,
    loadIdentities,
} from '~/features/IdentitySlice';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import styles from './GenesisAccount.module.scss';
import Button from '~/cross-app-components/Button';

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
    onSubmit(name: string, address?: string): void;
}

interface PickSettingsForm {
    name: string;
    address: string | undefined;
}

function PickSettings({ onSubmit }: PickSettingsProps) {
    const [existingAccount, setExistingAccount] = useState(false);

    function setSettings(values: PickSettingsForm) {
        const { name, address } = values;
        onSubmit(name, address);
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
                ) : null}
            </div>
            <Form.Submit className={styles.settingInput}>Continue</Form.Submit>
        </Form>
    );
}

enum Locations {
    Name,
    Context,
    Create,
    Confirm,
}

const subtitle = (currentLocation: Locations) => {
    switch (currentLocation) {
        case Locations.Name:
            return 'Settings';
        case Locations.Context:
            return 'Input Context file';
        case Locations.Create:
            return 'Export keys from ledger';
        case Locations.Confirm:
            return 'Confirm Details';
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
    const [identityId, setIdentityId] = useState<number>(defaultId);
    const [credential, setCredential] = useState<
        CredentialDeploymentValues | undefined
    >();

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

        const typedCredential = await createGenesisAccount(
            ledger,
            identityId,
            credentialNumber,
            ipInfo,
            arInfo,
            global,
            createdAt,
            displayMessage
        );
        const credentialContent = typedCredential.contents;

        let address = `genesis-${credentialContent.credId}`;

        if (accountAddress) {
            address = accountAddress;
        }

        const success = await saveFile(
            JSON.stringify(typedCredential),
            'Save credential'
        );

        if (success) {
            const account: Account = {
                status: AccountStatus.Genesis,
                address,
                name: accountName,
                identityId,
                maxTransactionId: 0,
                isInitial: false,
            };

            importAccount(account);
            insertNewCredential(
                dispatch,
                address,
                credentialNumber,
                identityId,
                undefined,
                credentialContent
            );
            setCredential(credentialContent);
            setLocation(Locations.Confirm);
        }
    }

    function Create() {
        return (
            <div className={styles.genesisContainer}>
                <SimpleLedger ledgerCall={createAccount} />
            </div>
        );
    }

    function Confirm() {
        if (!credential) {
            return null;
        }

        return (
            <div className={styles.genesisContainer}>
                <h3>Credential Id: </h3>
                <p>{credential.credId}</p>
                <h3>Public keys: </h3>
                {Object.entries(credential.credentialPublicKeys.keys).map(
                    ([index, value]) => (
                        <p key={index}>
                            {index}: {value.verifyKey}
                        </p>
                    )
                )}
                <p>Threshold: {credential.credentialPublicKeys.threshold}</p>
                <Button
                    onClick={() =>
                        dispatch(push(routes.MULTISIGTRANSACTIONS_EXPORT_KEY))
                    }
                >
                    Done
                </Button>
            </div>
        );
    }

    function Current() {
        switch (currentLocation) {
            case Locations.Name:
                return (
                    <PickSettings
                        onSubmit={(name: string, address?: string) => {
                            setAccountName(name);
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
            case Locations.Confirm:
                return <Confirm />;
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
