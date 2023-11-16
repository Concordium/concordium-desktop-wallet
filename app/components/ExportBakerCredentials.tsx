import clsx from 'clsx';
import React from 'react';
import Button from '~/cross-app-components/Button';
import Loading from '~/cross-app-components/Loading';
import { useAccountInfo } from '~/utils/dataHooks';
import saveFile from '~/utils/FileHelper';
import type { BakerKeys } from '~/utils/rustInterface';
import { ClassName } from '~/utils/types';
import DisplayPublicKey from './Transfers/DisplayPublicKey';

interface Props extends ClassName {
    accountAddress: string;
    bakerKeys?: BakerKeys;
    onContinue: () => void;
    buttonClassName?: string;
    hasExported?: boolean;
}

export default function ExportBakerCredentials({
    accountAddress,
    bakerKeys,
    onContinue,
    className,
    buttonClassName,
    hasExported,
}: Props) {
    const accountInfo = useAccountInfo(accountAddress);

    const onExport = async () => {
        if (accountInfo === undefined || bakerKeys === undefined) {
            return;
        }
        // We have to manually insert the bakerId into the JSON, because JS integers only supports 53bit precision, and JSON.stringify doesn't handle bigints.
        const fileString = JSON.stringify({
            bakerId: 0, // Placeholder
            aggregationSignKey: bakerKeys.aggregationSecret,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            electionPrivateKey: bakerKeys.electionSecret,
            electionVerifyKey: bakerKeys.electionPublic,
            signatureSignKey: bakerKeys.signatureSecret,
            signatureVerifyKey: bakerKeys.signaturePublic,
        }).replace(
            '"bakerId":0',
            `"bakerId":${accountInfo.accountIndex.toString()}`
        );

        const success = await saveFile(fileString, {
            title: 'Save validator credentials',
            defaultPath: 'validator-credentials.json',
        });
        if (success) {
            onContinue();
        }
    };

    return (
        <div className={clsx('flexColumn flexChildFill', className)}>
            <div className="flexChildFill">
                {bakerKeys === undefined ? (
                    <Loading inline text="Generating validator keys" />
                ) : (
                    <>
                        <p className="mT0">
                            Your validator keys have been generated. Before you
                            can continue, you must export and save them. The
                            keys will have to be placed with the validator node.
                        </p>
                        <DisplayPublicKey
                            name="Election verify key:"
                            publicKey={bakerKeys.electionPublic}
                        />
                        <DisplayPublicKey
                            name="Signature verify key:"
                            publicKey={bakerKeys.signaturePublic}
                        />
                        <DisplayPublicKey
                            name="Aggregation verify key:"
                            publicKey={bakerKeys.aggregationPublic}
                        />
                    </>
                )}
            </div>
            <Button
                disabled={bakerKeys === undefined}
                className={clsx('mT50', buttonClassName)}
                onClick={hasExported ? onContinue : onExport}
            >
                {hasExported ? 'Continue' : 'Export validator credentials'}
            </Button>
        </div>
    );
}
