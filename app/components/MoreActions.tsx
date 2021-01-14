import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Account, AccountInfo } from '../utils/types';
import styles from './Transaction.css';
import routes from '../constants/routes.json';
import locations from '../constants/moreActionLocations.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';

export default function MoreActions(
    account: Account,
    accountInfo: AccountInfo
) {
    const items = [
        { name: 'Account Address', location: locations.accountAddress },
        { name: 'Release Schedule', location: locations.releaseSchedule },
    ];
    const [location, setLocation] = useState(locations.list);

    function chosenComponent() {
        switch (location) {
            case locations.list:
                return (
                    <>
                        <Link to={routes.ACCOUNTS}>
                            <button type="submit">x</button>
                        </Link>
                        {items.map((item) => (
                            <div
                                onClick={() => setLocation(item.location)}
                                key={item.location}
                                className={styles.moreActionsItem}
                            >
                                {item.name}
                            </div>
                        ))}
                    </>
                );
            case locations.accountAddress:
                return (
                    <ShowAccountAddress
                        account={account}
                        returnFunction={() => setLocation(locations.list)}
                    />
                );
            case locations.releaseSchedule:
                return (
                    <ShowReleaseSchedule
                        accountInfo={accountInfo}
                        returnFunction={() => setLocation(locations.list)}
                    />
                );
            default:
                return <div />;
        }
    }

    return <div className={styles.transactionBox}>{chosenComponent()}</div>;
}
