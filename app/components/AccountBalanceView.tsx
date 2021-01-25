import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Header } from 'semantic-ui-react';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/gtu';
import {
    setViewingShielded,
    viewingShieldedSelector,
} from '../features/TransactionSlice';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '../features/AccountSlice';
/**
 * Displays the chosen Account's balance, and contains
 * buttons to toggle whether viewing shielded or unshielded balance/transactions.
 */
export default function AccountBalanceView(): JSX.Element {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account || !accountInfo) {
        return null; // TODO: add display for pending account (which have no accountinfo)
    }

    const buttons = (
        <Button.Group>
            <Button
                disabled={!viewingShielded}
                onClick={() => dispatch(setViewingShielded(false))}
            >
                Balance
            </Button>
            <Button
                disabled={viewingShielded}
                onClick={() => dispatch(setViewingShielded(true))}
            >
                Shielded Balance
            </Button>
        </Button.Group>
    );

    let main;
    if (viewingShielded) {
        main = (
            <Header as="h1" color="blue">
                {fromMicroUnits(account.totalDecrypted)}
                {account.allDecrypted ? '' : ' + ?'}
            </Header>
        );
    } else {
        main = (
            <>
                <Header as="h1" color="blue">
                    {fromMicroUnits(accountInfo.accountAmount)}
                </Header>
                <Header color="blue">
                    At disposal:
                    {fromMicroUnits(
                        parseInt(accountInfo.accountAmount, 10) -
                            parseInt(
                                accountInfo.accountReleaseSchedule.total,
                                10
                            )
                    )}
                </Header>
                <Header color="blue">
                    Staked:
                    {fromMicroUnits(0)}
                </Header>
            </>
        );
    }

    return (
        <Container className={styles.accountBalanceView} fluid>
            {buttons}
            {main}
        </Container>
    );
}
