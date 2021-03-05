import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Divider, Header, Segment } from 'semantic-ui-react';
import Identicon from 'react-identicons';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import LedgerComponent from '../../../components/ledger/LedgerComponent';
import PageLayout from '../../../components/PageLayout';
import Button from '../../../cross-app-components/Button';
import ConcordiumLedgerClient from '../../../features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel1Path,
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '../../../features/ledger/Path';
import { saveFile } from '../../../utils/FileHelper';
import { ExportKeyType, getKeyDisplay } from '../ExportKeyList';
import { SignedPublicKey } from '../../../utils/types';
import styles from './ExportKeyView.module.scss';
import routes from '../../../constants/routes.json';

interface ParamTypes {
    keyType: ExportKeyType;
}

interface PublicKeyExportFormat {
    schemeId: string;
    verifyKey: string;
    signature: string;
    type: ExportKeyType;
}

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
            case ExportKeyType.Account:
                // TODO Implement support for exporting account keys. They need a separate flow, as
                // they need to provide some input to determine the key to export.
                throw new Error(
                    'Export of account keys is not yet implemented.'
                );
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
            <Segment textAlign="center">
                <Header>New {getKeyDisplay(keyType)}</Header>
                {signedPublicKey.key}
                <Header>Identicon</Header>
                Click to copy
                <Divider clearing hidden />
                <Identicon string={signedPublicKey.key} size={128} />
                <Divider clearing hidden />
                <div className={styles.actions}>
                    <Button
                        disabled={!signedPublicKey}
                        onClick={() => {
                            if (signedPublicKey) {
                                saveExportedPublicKey(signedPublicKey, keyType);
                            }
                        }}
                    >
                        Export
                    </Button>
                </div>
            </Segment>
        );
    } else {
        exportComponent = (
            <>
                <Segment basic textAlign="center">
                    To export your key, you must connect a secure hardware
                    wallet. After pressing the submit button, you can finish
                    exporting the key on the hardware wallet.
                </Segment>
                <LedgerComponent
                    ledgerCall={(
                        ledger: ConcordiumLedgerClient,
                        setMessage: (message: string) => void
                    ) => exportPublicKey(ledger, setMessage, keyType)}
                />
            </>
        );
    }

    let finishButton;
    if (signedPublicKey) {
        finishButton = (
            <Button onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}>
                Finish
            </Button>
        );
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi Signature Transactions</h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <Header textAlign="center">
                    Export your {getKeyDisplay(keyType)}
                </Header>
                {exportComponent}
                <div className={styles.actions}>{finishButton}</div>
            </PageLayout.Container>
        </PageLayout>
    );
}
