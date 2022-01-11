import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PageLayout from '~/components/PageLayout';
import Button from '~/cross-app-components/Button';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel1Path,
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '~/features/ledger/Path';
import saveFile from '~/utils/FileHelper';
import {
    ExportKeyType,
    PublicKeyExportFormat,
    SignedPublicKey,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { getKeyDisplay } from '../menu/ExportKeyList';
import styles from './ExportKeyView.module.scss';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import PrintButton from '~/components/PrintButton';
import PrintFormat from './ExportKeyPrintFormat';
import TextArea from '~/components/Form/TextArea';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';

interface ParamTypes {
    keyType: ExportKeyType;
}

/**
 * Component for exporting a specific key type determined by the
 * parameter input.
 */
export default function ExportKeyView(): JSX.Element {
    const [signedPublicKey, setSignedPublicKey] = useState<SignedPublicKey>();
    const [note, setNote] = useState<string>();
    const [image, setImage] = useState<string>();
    const { keyType } = useParams<ParamTypes>();
    const dispatch = useDispatch();

    async function exportPublicKey(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void,
        exportKeyType: ExportKeyType
    ) {
        let path;
        switch (exportKeyType) {
            case ExportKeyType.Root:
                path = getGovernanceRootPath();
                break;
            case ExportKeyType.Level1:
                path = getGovernanceLevel1Path();
                break;
            case ExportKeyType.Level2:
                path = getGovernanceLevel2Path();
                break;
            default:
                throw new Error(
                    `An unsupported keyType was received: ${keyType}`
                );
        }
        setMessage(
            'Waiting for the user to finish the process on the hardware wallet.'
        );
        setSignedPublicKey(await ledger.getSignedPublicKey(path));
    }

    function buildExportFormat(
        sPublicKey: SignedPublicKey,
        exportKeyType: ExportKeyType
    ) {
        const publicKeyExport: PublicKeyExportFormat = {
            key: { verifyKey: sPublicKey.key, schemeId: 'Ed25519' },
            signature: sPublicKey.signature,
            type: exportKeyType,
            note,
        };
        return publicKeyExport;
    }

    async function saveExportedPublicKey(
        sPublicKey: SignedPublicKey,
        exportKeyType: ExportKeyType
    ) {
        const publicKeyExport = buildExportFormat(sPublicKey, exportKeyType);
        const publicKeyExportJson = JSON.stringify(publicKeyExport);
        await saveFile(publicKeyExportJson, {
            title: 'Save exported public-key',
            defaultPath: `public-key-${exportKeyType}.json`,
        });
    }

    let exportComponent;
    if (signedPublicKey) {
        exportComponent = (
            <>
                <p>
                    You can now export your new public key. It is recommended
                    that you copy the identicon, and send that via a separate
                    secure channel.
                </p>
                <Card className={styles.card}>
                    <PrintButton className={styles.printButton}>
                        <PrintFormat
                            image={image || ''}
                            publicKeyExport={buildExportFormat(
                                signedPublicKey,
                                keyType
                            )}
                        />
                    </PrintButton>
                    <h3>New {getKeyDisplay(keyType)}</h3>
                    <PublicKeyDetails
                        className="mV40"
                        publicKey={signedPublicKey.key}
                    />
                    <CopiableIdenticon
                        data={signedPublicKey.key}
                        setScreenshot={setImage}
                    />
                    <TextArea
                        label="Note"
                        placeholder="Here you can add a note describing your key"
                        value={note || ''}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <div>
                        <Button
                            className={styles.button}
                            disabled={!signedPublicKey}
                            onClick={() => {
                                if (signedPublicKey) {
                                    saveExportedPublicKey(
                                        signedPublicKey,
                                        keyType
                                    );
                                }
                            }}
                        >
                            Export
                        </Button>
                    </div>
                </Card>
            </>
        );
    } else {
        exportComponent = (
            <>
                <p>
                    To export your key, you must connect a secure hardware
                    wallet. After pressing the submit button, you can finish
                    exporting the key on the hardware wallet.
                </p>
                <Card className={styles.card}>
                    <Ledger
                        ledgerCallback={(
                            ledger: ConcordiumLedgerClient,
                            setMessage: (message: string) => void
                        ) => exportPublicKey(ledger, setMessage, keyType)}
                    >
                        {({
                            isReady,
                            statusView,
                            submitHandler = asyncNoOp,
                        }) => (
                            <>
                                {statusView}
                                <Button
                                    className={styles.button}
                                    onClick={submitHandler}
                                    disabled={!isReady}
                                >
                                    Submit
                                </Button>
                            </>
                        )}
                    </Ledger>
                </Card>
            </>
        );
    }

    const finishButton = (
        <Button
            className={styles.finish}
            disabled={!signedPublicKey}
            onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
        >
            Finish
        </Button>
    );

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi signature transactions</h1>
            </PageLayout.Header>
            <PageLayout.Container className={styles.container} padding="both">
                <h2>Export your {getKeyDisplay(keyType)}</h2>
                <div className={styles.details}>{exportComponent}</div>
                {finishButton}
            </PageLayout.Container>
        </PageLayout>
    );
}
