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
        const response =  await getTransactionStatus(transactionId);
        const data = response.getValue();
        console.log(data);
        if (data === "null") {
            console.log(data);
        } else {
            dataObject = JSON.parse(data);
            const status = dataObject.status;
            if (status === "finalized") {
                console.log("final", data);
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
            <button onClick={() => setLocation(locations.chooseRecipient)}>
                {' '}
                {recipient ? recipient.name : 'Select Recipient'}{' '}
            </button>
            <button
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
                <button>{'<--'}</button>
            </Link>
            {addressBook.map((entry) => (
                <div key={entry} onClick={() => chooseRecipientOnClick(entry)}>
                    {entry.name}
                </div>
            ))}
        </div>
    );

    const TransferSubmitted = () => {
        const dispatch = useDispatch();

        useEffect(() => {
            let hash = getTransactionHash(transaction).toString(
                'hex'
            );
            confirmTransaction(hash);
        }, [transaction])
        return (
            <div>
                <pre>
                    {`
                    Amount: G ${amount}
                    Estimated fee: G 1
                    To: ${recipient.name} (${recipient.address})
                    TransactionHash: ${getTransactionHash(transaction).toString(
                        'hex'
                    )}
                    `}
                </pre>
                <Link to={routes.ACCOUNTS}>
                    <button>Finish</button>
                </Link>
            </div>
        )
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
                        setTransaction={setTransaction}
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
                <button>x</button>
            </Link>
            <div key={location}> {chosenComponent()}</div>
        </div>
    );
}
