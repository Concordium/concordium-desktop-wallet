import { goBack } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ExportBakerCredentials from '~/components/ExportBakerCredentials';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import Loading from '~/cross-app-components/Loading';
import { isDefined } from '~/utils/basicHelpers';
import { useAsyncMemo } from '~/utils/hooks';
import { BakerKeyVariants } from '~/utils/rust.worker';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import { Account } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

interface Props {
    keyVariant: BakerKeyVariants;
    account: Account;
    initialKeys?: BakerKeys;
    onContinue(keys: BakerKeys): void;
}

export default function GenerateBakerKeys({
    onContinue,
    keyVariant,
    account,
    initialKeys,
}: Props) {
    const dispatch = useDispatch();
    const [error, setError] = useState<string>();

    const keys = useAsyncMemo(
        async () =>
            initialKeys ?? generateBakerKeys(account?.address, keyVariant),
        () => setError("Couldn't generate baker keys"),
        [account?.address, keyVariant, initialKeys]
    );

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header={error}
                onClick={() => dispatch(goBack())}
            />
            {keys ? (
                <ExportBakerCredentials
                    bakerKeys={keys}
                    accountAddress={account.address}
                    onContinue={() => onContinue(keys)}
                    className="mT30"
                    buttonClassName={styles.continue}
                    hasExported={isDefined(initialKeys)}
                />
            ) : (
                <Loading inline text="Generating baker keys" />
            )}
        </>
    );
}
