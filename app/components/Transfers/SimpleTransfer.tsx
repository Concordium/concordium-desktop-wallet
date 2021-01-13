import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import styles from '../Transaction.css';
import routes from '../../constants/routes.json';
import ConfirmTransfer from './ConfirmTransfer';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import locations from '../../constants/transferLocations.json';
import { AddressBookEntry, Account } from '../../utils/types';

export default function SimpleTransfer(account: Account) {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState(undefined);
    const [transaction, setTransaction] = useState(undefined);
    const [location, setLocation] = useState(locations.pickAmount);

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setLocation(locations.pickAmount);
    }

    function chosenComponent() {
        switch (location) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        setLocation={setLocation}
                        recipient={recipient}
                        amount={amount}
                        setAmount={setAmount}
                    />
                );
            case locations.pickRecipient:
                return (
                    <PickRecipient
                        returnFunction={() =>
                            push(routes.ACCOUNTS_SIMPLETRANSFER_PICKAMOUNT)
                        }
                        pickRecipient={chooseRecipientOnClick}
                    />
                );
            case locations.confirmTransfer:
                return (
                    <ConfirmTransfer
                        setLocation={setLocation}
                        recipient={recipient}
                        fromAddress={account.address}
                        amount={amount}
                        transaction={transaction}
                        setTransaction={setTransaction}
                        account={account}
                    />
                );
            case locations.transferSubmitted:
                return (
                    <FinalPage
                        transaction={transaction}
                        recipient={recipient}
                    />
                );
            default:
                return <div />;
        }
    }

    return (
        <div>
            <div key={location} className={styles.transactionBox}>
                <Link to={routes.ACCOUNTS}>
                    <button type="submit">x</button>
                </Link>
                {chosenComponent()}
            </div>
        </div>
    );
}
