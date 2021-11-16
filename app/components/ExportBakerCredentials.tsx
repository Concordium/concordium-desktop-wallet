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
        const fileString = JSON.stringify({
            bakerId: accountInfo.accountIndex.toString(),
            aggregationSignKey: bakerKeys.aggregationSecret,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            electionPrivateKey: bakerKeys.electionSecret,
            electionVerifyKey: bakerKeys.electionPublic,
            signatureSignKey: bakerKeys.signatureSecret,
            signatureVerifyKey: bakerKeys.signaturePublic,
        });
        const success = await saveFile(fileString, {
            title: 'Save Baker Credentials',
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
                Export Baker Credentials
            </Button>
        </div>
    );
}
