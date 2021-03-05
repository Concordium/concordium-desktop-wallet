import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Divider, Header, Segment } from 'semantic-ui-react';
import Identicon from 'react-identicons';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import PageLayout from '../../components/PageLayout';
import Button from '../../cross-app-components/Button';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    getGovernanceLevel1Path,
    getGovernanceLevel2Path,
    getGovernanceRootPath,
} from '../../features/ledger/Path';
import { saveFile } from '../../utils/FileHelper';
import { ExportKeyType, getKeyDisplay } from './ExportKeyList';

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
    const [publicKey, setPublicKey] = useState<Buffer>();
    const { keyType } = useParams<ParamTypes>();

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
        setPublicKey(await ledger.getPublicKey(path));
    }

    async function saveExportedPublicKey(
        verifyKey: string,
        exportKeyType: ExportKeyType
    ) {
        const publicKeyExport: PublicKeyExportFormat = {
            schemeId: 'Ed25519',
            verifyKey,
            signature: '',
            type: exportKeyType,
        };
        const publicKeyExportJson = JSON.stringify(publicKeyExport);
        await saveFile(publicKeyExportJson, 'Save exported public-key');
    }

    let exportComponent;
    if (publicKey) {
        exportComponent = (
            <Segment textAlign="center">
                <Header>New {getKeyDisplay(keyType)}</Header>
                {publicKey.toString('hex')}
                <Header>Identicon</Header>
                Click to copy
                <Divider clearing hidden />
                <Identicon string={publicKey.toString('hex')} size={128} />
            </Segment>
        );
    } else {
        exportComponent = (
            <>
                <Segment basic textAlign="center">
                    To export your key, you must connect a secure hardware
                    wallet. After pressing the export button, you can finish
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
                <Button
                    disabled={!publicKey}
                    onClick={() => {
                        if (publicKey) {
                            saveExportedPublicKey(
                                publicKey.toString('hex'),
                                keyType
                            );
                        }
                    }}
                >
                    Export
                </Button>
            </PageLayout.Container>
        </PageLayout>
    );
}
