import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation, Link } from 'react-router-dom';
import { Button, Header, Grid } from 'semantic-ui-react';
import { stringify } from '../../utils/JSONHelper';
import routes from '../../constants/routes.json';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import { AddressBookEntry, Account } from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';
import locations from '../../constants/transferLocations.json';
import { createEncryptedTransferTransaction } from '../../utils/transactionHelpers';
import { TransferState } from '../../utils/transactionTypes';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a simple transfer.
 */
export default function SimpleTransfer({ account }: Props) {
    const dispatch = useDispatch();
    const location = useLocation<TransferState>();

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    const [amount, setAmount] = useState<string>(location?.state?.amount); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient
    );

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setSubLocation(locations.pickAmount);
    }

    function ChosenComponent() {
        switch (subLocation) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        recipient={recipient}
                        header="Send shieded funds"
                        amount={amount}
                        setAmount={setAmount}
                        toPickRecipient={() =>
                            setSubLocation(locations.pickRecipient)
                        }
                        toConfirmTransfer={async () => {
                            if (!recipient) {
                                throw new Error('Unexpected missing recipient');
                            }

                            const transaction = await createEncryptedTransferTransaction(
                                account.address,
                                toMicroUnits(amount),
                                recipient.address
                            );

                            dispatch(
                                push({
                                    pathname: routes.SUBMITTRANSFER,
                                    state: {
                                        confirmed: {
                                            pathname:
                                                routes.ACCOUNTS_SIMPLETRANSFER,
                                            state: {
                                                initialPage:
                                                    locations.transferSubmitted,
                                                transaction: stringify(
                                                    transaction
                                                ),
                                                recipient,
                                            },
                                        },
                                        cancelled: {
                                            pathname:
                                                routes.ACCOUNTS_SIMPLETRANSFER,
                                            state: {
                                                initialPage:
                                                    locations.pickAmount,
                                                amount,
                                                recipient,
                                            },
                                        },
                                        transaction: stringify(transaction),
                                        account,
                                    },
                                })
                            );
                        }}
                    />
                );
            case locations.pickRecipient:
                return <PickRecipient pickRecipient={chooseRecipientOnClick} />;
            case locations.transferSubmitted: {
                return <FinalPage location={location} />;
            }
            default:
                return null;
        }
    }

    return (
        <>
            <Grid columns="3">
                <Grid.Column>
                    {subLocation === locations.pickRecipient ||
                    subLocation === locations.confirmTransfer ? (
                        <Button
                            onClick={() => setSubLocation(locations.pickAmount)}
                        >
                            {'<--'}
                        </Button>
                    ) : null}
                </Grid.Column>
                <Grid.Column textAlign="center">
                    <Header>Send Transfer</Header>
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
