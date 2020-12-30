import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './Styling.css';
import routes from '../constants/routes.json';
import {
    loadAddressBook,
    addressBookSelector,
} from '../features/AddressBookSlice';
import ConfirmTransfer from './ConfirmTransfer';
import locations from '../constants/transferLocations.json';
import { getTransactionHash } from '../utils/transactionSerialization';
import { getTransactionStatus } from '../utils/client';

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function confirmTransaction(transactionId) {
    while (true) {
        const response = await getTransactionStatus(transactionId);
        const data = response.getValue();
        console.log(data);
        if (data === 'null') {
            // TODO: Transaction was rejected / is absent
           break;
        } else {
            const dataObject = JSON.parse(data);
            const { status } = dataObject;
            if (status === 'finalized') {
                // TODO: Transaction is on the chain
                break;
            }
        }
        await sleep(10000);
    }
}

export default function SimpleTransfer(account) {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState(undefined);
    const [transaction, setTransaction] = useState(undefined);
    const [transactionHash, setTransactionHash] = useState(undefined);
    const [location, setLocation] = useState(locations.pickAmount);

    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);
    const addressBook = useSelector(addressBookSelector);

    function updateAmount(newAmount) {
        /// Checks that the input is a number and that it does not split micro units
        if (!Number.isNaN(newAmount) && Number.isInteger(newAmount * 1000000)) {
            setAmount(newAmount);
        }
    }

    const PickAmount = () => (
        <div>
            <span className={styles.modalElement}>
                <input
                    name="name"
                    className={styles.input}
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => updateAmount(e.target.value)}
                    data-tid="hashInput"
                    autoFocus
                />
            </span>
            <button
                type="submit"
                onClick={() => setLocation(locations.chooseRecipient)}
            >
                {' '}
                {recipient ? recipient.name : 'Select Recipient'}{' '}
            </button>
            <button
                type="submit"
                onClick={() => setLocation(locations.confirmTransfer)}
                disabled={!recipient}
            >
                Continue
            </button>
        </div>
    );

    function chooseRecipientOnClick(entry) {
        setRecipient(entry);
        setLocation(locations.pickAmount);
    }

    const PickRecipient = () => (
        <div>
            <Link to={routes.ACCOUNTS_SIMPLETRANSFER_PICKAMOUNT}>
                <button type="submit">{'<--'}</button>
            </Link>
            {addressBook.map((entry) => (
                <div key={entry} onClick={() => chooseRecipientOnClick(entry)}>
                    {entry.name}
                </div>
            ))}
        </div>
    );

    const TransferSubmitted = () => {
        useEffect(() => {
            confirmTransaction(transactionHash);
        }, []);
        return (
            <div>
                <pre>
                    {`
                    Amount: G ${amount}
                    Estimated fee: G 1
                    To: ${recipient.name} (${recipient.address})
                    TransactionHash: ${transactionHash}
                    `}
                </pre>
                <Link to={routes.ACCOUNTS}>
                    <button type="submit">Finish</button>
                </Link>
            </div>
        );
    };

    function chosenComponent() {
        switch (location) {
            case locations.pickAmount:
                return <PickAmount key={account.address} />;
            case locations.chooseRecipient:
                return <PickRecipient />;
            case locations.confirmTransfer:
                return (
                    <ConfirmTransfer
                        setLocation={setLocation}
                        recipient={recipient}
                        fromAddress={account.address}
                        amount={amount}
                        transaction={transaction}
                        setTransaction={setTransaction}
                        setTransactionHash={setTransactionHash}
                        account={account}
                    />
                );
            case locations.transferSubmitted:
                return <TransferSubmitted />;
            default:
                return <div />;
        }
    }

    return (
        <div>
            <Link to={routes.ACCOUNTS}>
                <button type="submit">x</button>
            </Link>
            <div key={location}> {chosenComponent()}</div>
        </div>
    );
}
