import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PageLayout from '~/components/PageLayout';
import Form from '~/components/Form';
import { importAccount } from '~/features/AccountSlice';
import { insertNewCredential } from '~/features/CredentialSlice';
import {
    Account,
    AccountStatus,
    IdentityStatus,
    GenesisCredential,
} from '~/utils/types';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { saveFile } from '~/utils/FileHelper';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import {
    identitiesSelector,
    importIdentities,
    loadIdentities,
} from '~/features/IdentitySlice';
import styles from './GenesisAccount.module.scss';
import Button from '~/cross-app-components/Button';
import PrintButton from '~/components/PrintButton';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import CreateCredential from './CreateCredential';

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
                buttonTitle="or browse to file"
                rules={{
                    required: 'File is required',
                }}
            />
            <Form.Submit>Submit</Form.Submit>
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
        <Form onSubmit={onSubmit}>
            <Form.Input
                className={styles.settingInput}
                name="name"
                placeholder="Account name"
                rules={{ required: 'name is required' }}
            />
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
const defaultId = 0;

// Component to create genesis account;
export default function GenesisAccount(): JSX.Element {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const [currentLocation, setLocation] = useState<Locations>(Locations.Name);
    const [accountName, setAccountName] = useState('');
    const [context, setContext] = useState<string | undefined>();
    const [identityId, setIdentityId] = useState<number>(defaultId);
    const [genesis, setGenesis] = useState<GenesisCredential>();
    const [credentialNumber, setCredentialNumber] = useState<number>();

    useEffect(() => {
        if (identities.length === 0) {
            const createdAt = getCurrentYearMonth();
            const validTo = (parseInt(createdAt, 10) + 100).toString(); // Should be 1 year after createdAt (Match what will be generated for account)
            const identityObject = {
                v: 0,
                value: {
                    attributeList: {
                        chosenAttributes: {},
                        createdAt,
                        validTo,
                    },
                },
            };

            const identity = {
                name: 'Genesis',
                id: defaultId,
                identityObject: JSON.stringify(identityObject),
                status: IdentityStatus.Genesis,
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

    function Confirm() {
        const [image, setImage] = useState<string>();
        if (!genesis) {
            throw new Error('Unexpected missing genesis data');
        }
        const credentialContent = genesis.credential.contents;

        const publicKey = credentialContent.credentialPublicKeys.keys[0];

        async function exportGenesis() {
            if (credentialNumber === undefined) {
                throw new Error('Unexpected missing credentialNumber');
            }

            const address = credentialContent.credId;

            const success = await saveFile(
                JSON.stringify(genesis),
                'Save credential',
                `${accountName}_${credentialContent.credId.substring(
                    0,
                    8
                )}.json`
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
            }
            dispatch(push(routes.MULTISIGTRANSACTIONS_EXPORT_KEY));
        }

        return (
            <div className={styles.genesisContainer}>
                <PrintButton className={styles.printButton}>
                    <h3>Account Name:</h3>
                    <p>{accountName}</p>
                    <h3>Credential Id: </h3>
                    <p>{credentialContent.credId}</p>
                    <h3>Public key: </h3>
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
                <Button onClick={exportGenesis}>Export</Button>
            </div>
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
                        identityId={identityId}
                        setCredentialNumber={setCredentialNumber}
                        setGenesis={setGenesis}
                        onFinish={() => setLocation(Locations.Confirm)}
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
                <h1> New Account | Genesis Account </h1>
            </PageLayout.Header>
            <PageLayout.Container className={styles.genesisContainer}>
                <h2>{subtitle(currentLocation)}</h2>
                <Current />
            </PageLayout.Container>
        </PageLayout>
    );
}
