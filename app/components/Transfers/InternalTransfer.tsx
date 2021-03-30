import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import {
    Account,
    TransferToEncrypted,
    TransferToPublic,
    TransactionKindId,
} from '~/utils/types';
import { toMicroUnits } from '~/utils/gtu';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import TransferView from './TransferView';

interface Specific<T> {
    amountHeader: string;
    createTransaction: (address: string, amount: bigint) => Promise<T>;
    location: string;
    transactionKind: TransactionKindId;
}

interface Props<T> {
    account: Account;
    specific: Specific<T>;
}

/**
 * Controls the flow of creating a TransferToEncrypted/TransferToPublic transfer.
 */
export default function InternalTransfer<
    T extends TransferToPublic | TransferToEncrypted
>({ account, specific }: Props<T>) {
    const dispatch = useDispatch();
    const location = useLocation<TransferState>();

    const [error, setError] = useState<string | undefined>();
    const [estimatedFee, setEstimatedFee] = useState<bigint>(0n);

    useEffect(() => {
        getTransactionKindCost(specific.transactionKind)
            .then((transferCost) => setEstimatedFee(transferCost))
            .catch((e) =>
                setError(`Unable to get transaction cost due to: ${e}`)
            );
    }, [specific.transactionKind, setEstimatedFee]);

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    function ChosenComponent() {
        switch (subLocation) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        header={specific.amountHeader}
                        estimatedFee={estimatedFee}
                        defaultAmount={location?.state?.amount}
                        toPickRecipient={undefined}
                        toConfirmTransfer={async (amount: string) => {
                            const transaction = await specific.createTransaction(
                                account.address,
                                toMicroUnits(amount)
                            );
                            transaction.estimatedFee = estimatedFee;

                            const transactionJSON = stringify(transaction);
                            dispatch(
                                push({
                                    pathname: routes.SUBMITTRANSFER,
                                    state: {
                                        confirmed: {
                                            pathname: specific.location,
                                            state: {
                                                initialPage:
                                                    locations.transferSubmitted,
                                                transaction: transactionJSON,
                                            },
                                        },
                                        cancelled: {
                                            pathname: specific.location,
                                            state: {
                                                initialPage:
                                                    locations.pickAmount,
                                                amount,
                                            },
                                        },
                                        transaction: transactionJSON,
                                        account,
                                    },
                                })
                            );
                        }}
                    />
                );
            case locations.transferSubmitted: {
                return <FinalPage location={location} />;
            }
            default:
                throw new Error('Unexpected location');
        }
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                content={error}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <TransferView
                showBack={subLocation === locations.confirmTransfer}
                exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
                backOnClick={() => setSubLocation(locations.pickAmount)}
            >
                <ChosenComponent />
            </TransferView>
        </>
    );
}
