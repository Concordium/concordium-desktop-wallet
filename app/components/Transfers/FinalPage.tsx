import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { AccountTransaction, AddressBookEntry } from '../../utils/types';

interface Props {
    transaction: AccountTransaction;
    recipient: AddressBookEntry;
}

export default function FinalPage({
    transaction,
    recipient,
}: Props): JSX.Element {
    return (
        <div>
            <h2> Transfer Submitted! </h2>
            <pre>
                {`
                    Amount: \u01E4 ${transaction.payload.amount}
                    Estimated fee: \u01E4 1
                    To: ${recipient.name} (${recipient.address})
                `}
            </pre>
            <Link to={routes.ACCOUNTS}>
                <button type="submit">Finish</button>
            </Link>
        </div>
    );
}
