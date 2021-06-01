import React, { useState, useCallback } from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import { CreationKeys } from '~/utils/types';
import { exportKeysFromLedger } from '~/utils/rustInterface';
import { LedgerCallback } from './util';
import SimpleLedger from './SimpleLedger';

interface Props {
    identityNumber?: number;
    credentialNumber?: number;
    className?: string;
    compareButtonClassName?: string;
    ledgerCallback: (keys: CreationKeys) => LedgerCallback;
    preCallback?: LedgerCallback<{ identityNumber: number }> | LedgerCallback;
    disabled?: boolean;
}

export default function SimpleLedgerWithCreationKeys({
    className,
    identityNumber,
    credentialNumber,
    ledgerCallback,
    preCallback,
    compareButtonClassName,
    disabled,
}: Props) {
    const [keys, setKeys] = useState<CreationKeys>();
    const [finishedComparing, setFinishedComparing] = useState(false);

    const exportKeys = useCallback(
        async (
            ledger: ConcordiumLedgerClient,
            setMessage: (message: string | JSX.Element) => void
        ) => {
            let identity = identityNumber;
            if (preCallback) {
                const result = await preCallback(ledger, setMessage);
                if (identity === undefined && result) {
                    identity = result.identityNumber;
                }
            }

            if (identity === undefined) {
                throw new Error(
                    'An identityNumber has to be supplied. This is an internal error.'
                );
            }

            if (credentialNumber === undefined) {
                throw new Error(
                    'Missing credential number, which is required to export keys'
                );
            }

            const exportedKeys = await exportKeysFromLedger(
                identity,
                credentialNumber,
                setMessage,
                ledger
            );
            setKeys(exportedKeys);
        },
        [credentialNumber, identityNumber, preCallback]
    );

    const callback = useCallback(
        async (
            ledger: ConcordiumLedgerClient,
            setMessage: (message: string | JSX.Element) => void
        ) => {
            if (keys) {
                await ledgerCallback(keys)(ledger, setMessage);
            } else {
                await exportKeys(ledger, setMessage);
            }
        },
        [keys, exportKeys, ledgerCallback]
    );

    const showComparing = keys && !finishedComparing;
    return (
        <>
            {showComparing && (
                <Card className={className} header="Compare public key">
                    <PublicKeyDetails publickey={keys?.publicKey || ''} />
                    <Button
                        onClick={() => setFinishedComparing(true)}
                        className={compareButtonClassName}
                    >
                        Confirm
                    </Button>
                </Card>
            )}
            {!showComparing && (
                <SimpleLedger
                    className={className}
                    ledgerCall={callback}
                    disabled={disabled}
                />
            )}
        </>
    );
}
