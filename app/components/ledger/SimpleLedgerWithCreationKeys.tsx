import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import { CreationKeys, BlsKeyTypes } from '~/utils/types';

import { exportKeysFromLedger } from '~/utils/rustInterface';
import { LedgerCallback } from './util';

import { asyncNoOp } from '~/utils/basicHelpers';
import Ledger from './Ledger';

import styles from './SimpleLedger/SimpleLedger.module.scss';

interface Props {
    identityNumber?: number;
    credentialNumber?: number;
    className?: string;
    compareButtonClassName?: string;
    ledgerCallback: (keys: CreationKeys) => LedgerCallback;
    preCallback?: LedgerCallback<{ identityNumber: number }> | LedgerCallback;
    disabled?: boolean;
    exportType: BlsKeyTypes;
}

export default function SimpleLedgerWithCreationKeys({
    className,
    identityNumber,
    credentialNumber,
    ledgerCallback,
    preCallback,
    compareButtonClassName,
    disabled,
    exportType,
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
                exportType,
                ledger
            );
            setKeys(exportedKeys);
        },
        [credentialNumber, identityNumber, preCallback, exportType]
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
        <Ledger ledgerCallback={callback}>
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <>
                    {showComparing && (
                        <Card className={className} header="Compare public key">
                            <PublicKeyDetails
                                className="mV40"
                                publicKey={keys?.publicKey || ''}
                            />
                            <Button
                                onClick={() => {
                                    setFinishedComparing(true);
                                    submitHandler();
                                }}
                                className={compareButtonClassName}
                            >
                                Continue
                            </Button>
                        </Card>
                    )}
                    {!showComparing && (
                        <Card
                            header="Device connection"
                            className={clsx(styles.root, className)}
                        >
                            <div className={styles.status}>{statusView}</div>
                            <Button
                                className={styles.submit}
                                onClick={submitHandler}
                                disabled={!isReady || disabled}
                            >
                                Submit
                            </Button>
                        </Card>
                    )}
                </>
            )}
        </Ledger>
    );
}
