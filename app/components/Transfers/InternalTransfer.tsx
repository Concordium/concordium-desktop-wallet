import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import { Account, TransferToEncrypted, TransferToPublic } from '~/utils/types';
import { toMicroUnits } from '~/utils/gtu';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import TransferView from './TransferView';

interface Specific<T> {
    amountHeader: string;
    createTransaction: (address: string, amount: bigint) => Promise<T>;
    location: string;
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

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    function ChosenComponent() {
        switch (subLocation) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        header={specific.amountHeader}
                        defaultAmount={location?.state?.amount}
                        toPickRecipient={undefined}
                        toConfirmTransfer={async (amount: string) => {
                            const transaction = await specific.createTransaction(
                                account.address,
                                toMicroUnits(amount)
                            );

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
        <TransferView
            showBack={subLocation === locations.confirmTransfer}
            exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
            backOnClick={() => setSubLocation(locations.pickAmount)}
        >
            <ChosenComponent />
        </TransferView>
    );
}
