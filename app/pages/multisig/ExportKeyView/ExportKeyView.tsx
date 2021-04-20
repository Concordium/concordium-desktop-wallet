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
import { saveFile } from '~/utils/FileHelper';
import { SignedPublicKey } from '~/utils/types';
import routes from '~/constants/routes.json';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { ExportKeyType, getKeyDisplay } from '../menu/ExportKeyList';
import styles from './ExportKeyView.module.scss';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';

interface ParamTypes {
    keyType: ExportKeyType;
}

interface PublicKeyExportFormat {
    schemeId: string;
    verifyKey: string;
    signature: string;
    type: ExportKeyType;
}

/**
 * Component for exporting a specific key type determined by the
 * parameter input.
 */
export default function ExportKeyView(): JSX.Element {
    const [signedPublicKey, setSignedPublicKey] = useState<SignedPublicKey>();
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

    async function saveExportedPublicKey(
        sPublicKey: SignedPublicKey,
        exportKeyType: ExportKeyType
    ) {
        const publicKeyExport: PublicKeyExportFormat = {
            schemeId: 'Ed25519',
            verifyKey: sPublicKey.key,
            signature: sPublicKey.signature,
            type: exportKeyType,
        };
        const publicKeyExportJson = JSON.stringify(publicKeyExport);
        await saveFile(publicKeyExportJson, 'Save exported public-key');
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
                <Card>
                    <h3>New {getKeyDisplay(keyType)}</h3>
                    {signedPublicKey.key}
                    <CopiableIdenticon data={signedPublicKey.key} />
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
                <h1>Multi Signature Transactions</h1>
            </PageLayout.Header>
            <PageLayout.Container className={styles.container}>
                <h2>Export your {getKeyDisplay(keyType)}</h2>
                <div className={styles.details}>{exportComponent}</div>
                {finishButton}
            </PageLayout.Container>
        </PageLayout>
    );
}
