import { goBack } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExportBakerCredentials from '~/components/ExportBakerCredentials';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import Card from '~/cross-app-components/Card';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { useAsyncMemo } from '~/utils/hooks';
import { BakerKeyVariants } from '~/utils/rust.worker';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';

import styles from './AccountDetailsPage.module.scss';

interface Props {
    header: string;
    keyVariant: BakerKeyVariants;
    onContinue(keys: BakerKeys): void;
}

export default function GenerateBakerKeys({
    onContinue,
    header,
    keyVariant,
}: Props) {
    const account = useSelector(chosenAccountSelector);
    const dispatch = useDispatch();
    const [error, setError] = useState<string>();

    const keys = useAsyncMemo(
        async () => {
            if (!account) {
                return undefined;
            }
            return generateBakerKeys(account?.address, keyVariant);
        },
        () => setError("Couldn't generate baker keys"),
        [account?.address, keyVariant]
    );

    if (!account) {
        throw new Error('No account selected');
    }

    return (
        <Card className="textCenter pB40">
            <SimpleErrorModal
                show={Boolean(error)}
                header={error}
                onClick={() => dispatch(goBack())}
            />
            <h3 className="bodyEmphasized">{header}</h3>
            {keys && (
                <ExportBakerCredentials
                    bakerKeys={keys}
                    accountAddress={account.address}
                    onContinue={() => onContinue(keys)}
                    className="mT30"
                    buttonClassName={styles.bakerFlowContinue}
                >
                    <p className="mT0">
                        Your baker keys have been generated. Make sure to export
                        and backup your baker credentials, as this will be the
                        only chance to export them.
                    </p>
                    <p>
                        Baker credentials are used by the Concordium node for
                        baking and contains private keys, which should be kept
                        secure.
                    </p>
                    <p>
                        If the baker credentials are lost or compromised, new
                        ones should be generated with the Update Baker Keys
                        function.
                    </p>
                    <p>
                        After exporting your baker credentials, you will be able
                        to continue and submit your public keys to the
                        Concordium blockchain.
                    </p>
                </ExportBakerCredentials>
            )}
        </Card>
    );
}
