import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic-ui-react';
import { Account, AccountInfo } from '../../utils/types';
import routes from '../../constants/routes.json';
import locations from '../../constants/moreActionLocations.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

const items = [
    { name: 'Account Address', location: locations.accountAddress },
    { name: 'Release Schedule', location: locations.releaseSchedule },
];

/**
 * Lists additional actions, for the account.
 * And controls the flow of those actions' pages.
 * TODO: Find a better name?
 */
export default function MoreActions({ account, accountInfo }: Props) {
    const [location, setLocation] = useState(locations.list);

    function ChosenComponent() {
        switch (location) {
            case locations.list:
                return (
                    <>
                        <Button as={Link} to={routes.ACCOUNTS}>
                            x
                        </Button>
                        <Menu vertical>
                            {items.map((item) => (
                                <Menu.Item
                                    onClick={() => setLocation(item.location)}
                                    key={item.location}
                                >
                                    {item.name}
                                </Menu.Item>
                            ))}
                        </Menu>
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
                return null;
        }
    }

    return <ChosenComponent />;
}
