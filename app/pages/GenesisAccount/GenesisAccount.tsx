import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PageLayout from '~/components/PageLayout';
import Form from '~/components/Form';
import { importAccount, loadAccounts } from '~/features/AccountSlice';
import { insertNewCredential } from '~/features/CredentialSlice';
import { Account, AccountStatus, GenesisAccount } from '~/utils/types';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { saveFile } from '~/utils/FileHelper';
import styles from './GenesisAccount.module.scss';
import Button from '~/cross-app-components/Button';
import PrintButton from '~/components/PrintButton';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import CreateCredential from './CreateCredential';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { loadIdentities } from '~/features/IdentitySlice';

interface CredentialNumberIdentityId {
    credentialNumber: number;
    identityId: number;
}

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
                className={styles.fileInput}
                name="file"
                placeholder="Drag and drop file here"
                defaultValue={null}
                buttonTitle="or browse to file"
                rules={{
                    required: 'File is required',
                }}
            />
            <Form.Submit className={styles.submitButton}>Submit</Form.Submit>
        </Form>
    );
}

interface PickNameProps {
    setName(name: string): void;
}

interface PickNameForm {
    name: string;
}

function PickName({ setName }: PickNameProps) {
    function onSubmit(values: PickNameForm) {
        const { name } = values;
        setName(name);
    }

    return (
        <Form onSubmit={onSubmit} className={styles.pickName}>
            <Form.Input
                className={styles.nameInput}
                name="name"
                placeholder="Account name"
                rules={{ required: 'Account name is required' }}
            />
            <Form.Submit className={styles.submitButton}>Continue</Form.Submit>
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
            return 'Choose Account Name';
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

/**
 * Component used to create a genesis account.
 */
export default function GenesisAccount(): JSX.Element {
    const dispatch = useDispatch();
    const [currentLocation, setLocation] = useState<Locations>(Locations.Name);
    const [accountName, setAccountName] = useState('');
    const [context, setContext] = useState<string | undefined>();
    const [genesisAccount, setGenesisAccount] = useState<GenesisAccount>();
    const [
        credentialNumberIdentityId,
        setCredentialNumberIdentityId,
    ] = useState<CredentialNumberIdentityId>();

    function Confirm() {
        const [image, setImage] = useState<string>();
        if (!genesisAccount) {
            throw new Error('Unexpected missing genesis account');
        }
        const credentialContent = genesisAccount.credential.contents;

        const publicKey = credentialContent.credentialPublicKeys.keys[0];

        async function exportGenesis() {
            if (credentialNumberIdentityId === undefined) {
                throw new Error(
                    'Credential number and identity id have not been set in time.'
                );
            }

            const address = credentialContent.credId; // We use the credId as a temporary 'address', which we will use to lookup the actual address after genesis.

            const success = await saveFile(JSON.stringify(genesisAccount), {
                title: 'Save credential',
                defaultPath: `${accountName.replace(
                    /\s/g,
                    '_'
                )}_${credentialContent.credId.substring(0, 8)}.json`,
            });

            if (success) {
                const account: Account = {
                    status: AccountStatus.Genesis,
                    address,
                    name: accountName,
                    identityId: credentialNumberIdentityId.identityId,
                    maxTransactionId: 0,
                    isInitial: false,
                };

                importAccount(account);
                insertNewCredential(
                    dispatch,
                    address,
                    credentialNumberIdentityId.credentialNumber,
                    credentialNumberIdentityId.identityId,
                    undefined,
                    credentialContent
                );
            }
            loadAccounts(dispatch);
            dispatch(push(routes.MULTISIGTRANSACTIONS_EXPORT_KEY));
        }

        return (
            <Card className={styles.confirmCard}>
                <PrintButton className={styles.printButton}>
                    <h1>Genesis Account</h1>
                    <h3>Account Name</h3>
                    <p>{accountName}</p>
                    <h3>Credential Id</h3>
                    <p>{credentialContent.credId}</p>
                    <h3>Public key</h3>
                    <p>{publicKey.verifyKey}</p>
                    <img src={image} alt="" />
                </PrintButton>
                <h3>Account Name:</h3>
                <p>{accountName}</p>
                <h3>Credential Id: </h3>
                <p>{credentialContent.credId}</p>
                <h3>Public key: </h3>
                <p>{publicKey.verifyKey}</p>
                <CopiableIdenticon
                    data={publicKey.verifyKey}
                    setScreenshot={setImage}
                />
                <Button className={styles.exportButton} onClick={exportGenesis}>
                    Export
                </Button>
            </Card>
        );
    }

    function Current() {
        switch (currentLocation) {
            case Locations.Name:
                return (
                    <PickName
                        setName={(name: string) => {
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
                return (
                    <CreateCredential
                        setGenesisAccount={setGenesisAccount}
                        onFinish={(
                            credentialNumber: number,
                            identityId: number
                        ) => {
                            setLocation(Locations.Confirm);
                            setCredentialNumberIdentityId({
                                credentialNumber,
                                identityId,
                            });
                            loadIdentities(dispatch);
                        }}
                        context={context}
                    />
                );
            case Locations.Confirm:
                return <Confirm />;
            default:
                throw new Error('unknown location');
        }
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>New Account | Genesis Account</h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <h2>{subtitle(currentLocation)}</h2>
                <Current />
            </PageLayout.Container>
        </PageLayout>
    );
}
