import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import Button from '~/cross-app-components/Button';
import { useAccountInfo } from '~/utils/dataHooks';
import saveFile from '~/utils/FileHelper';
import type { BakerKeys } from '~/utils/rustInterface';
import { ClassName } from '~/utils/types';

type Props = ClassName &
    PropsWithChildren<{
        accountAddress: string;
        bakerKeys: BakerKeys;
        onContinue: () => void;
        buttonClassName?: string;
    }>;

export default function ExportBakerCredentials({
    accountAddress,
    bakerKeys,
    onContinue,
    className,
    children,
    buttonClassName,
}: Props) {
    const accountInfo = useAccountInfo(accountAddress);

    const onExport = async () => {
        if (accountInfo === undefined) {
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
            title: 'Save baker credentials',
            defaultPath: 'baker-credentials.json',
        });
        if (success) {
            onContinue();
        }
    };

    return (
        <div className={clsx('flexColumn', className)}>
            <div className="flexFill">{children}</div>
            <Button
                className={clsx('mT50', buttonClassName)}
                onClick={onExport}
            >
                Export baker credentials
            </Button>
        </div>
    );
}
