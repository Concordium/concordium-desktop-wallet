import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation, Link } from 'react-router-dom';
import { Header, Grid } from 'semantic-ui-react';
import Button from '~/cross-app-components/Button';
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

interface Specific<T> {
    title: string;
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

    // This is a string, to allows user input in GTU
    const [amount, setAmount] = useState<string>(location?.state?.amount);

    function ChosenComponent() {
        switch (subLocation) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        header={specific.amountHeader}
                        amount={amount}
                        setAmount={setAmount}
                        estimatedFee={estimatedFee}
                        toPickRecipient={undefined}
                        toConfirmTransfer={async () => {
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
                return null;
        }
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                content={error}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <Grid columns="3">
                <Grid.Column>
                    {subLocation === locations.confirmTransfer ? (
                        <Button
                            onClick={() => setSubLocation(locations.pickAmount)}
                        >
                            {'<--'}
                        </Button>
                    ) : null}
                </Grid.Column>
                <Grid.Column textAlign="center">
                    <Header>{specific.title}</Header>
                </Grid.Column>
                <Grid.Column textAlign="right">
                    <Link to={routes.ACCOUNTS}>
                        <Button>x</Button>
                    </Link>
                </Grid.Column>
            </Grid>
            <ChosenComponent />
        </>
    );
}
