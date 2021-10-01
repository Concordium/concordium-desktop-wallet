import { goBack, replace } from 'connected-react-router';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExportBakerCredentials from '~/components/ExportBakerCredentials';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import Card from '~/cross-app-components/Card';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { useAsyncMemo } from '~/utils/hooks';
import { generateBakerKeys } from '~/utils/rustInterface';
import routes from '~/constants/routes.json';

export default function GenerateBakerKeys() {
    const account = useSelector(chosenAccountSelector);
    const dispatch = useDispatch();
    const [error, setError] = useState<string>();

    const [keys] = useAsyncMemo(
        async () => {
            if (!account) {
                return undefined;
            }
            return generateBakerKeys(account?.address, 'ADD');
        },
        () => setError("Couldn't generate baker keys"),
        [account?.address]
    );

    const next = useCallback(() => dispatch(replace(routes.SUBMITTRANSFER)), [
        dispatch,
    ]);

    const title = 'Add baker';

    if (!account) {
        throw new Error('No account selected');
    }

    return (
        <Card className="textCenter">
            <SimpleErrorModal
                show={Boolean(error)}
                header={error}
                onClick={() => dispatch(goBack())}
            />
            <h3>{title}</h3>
            {keys && (
                <ExportBakerCredentials
                    bakerKeys={keys}
                    accountAddress={account.address}
                    onContinue={next}
                >
                    <p>
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
