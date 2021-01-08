import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    loadAccounts,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
} from '../features/AccountSlice';
import styles from './Accounts.css';
import AccountListElement from './AccountListElement';
import routes from '../constants/routes.json';
import { getConsensusInfo } from '../utils/client';

async function initialize(setLatestBlockHash, dispatch) {
    const consenusInfo = JSON.parse((await getConsensusInfo()).getValue());
    setLatestBlockHash(consenusInfo.lastFinalizedBlock);
    loadAccounts(dispatch);
}

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);
    const [latestBlockHash, setLatestBlockHash] = useState(undefined);

    useEffect(() => {
        initialize(setLatestBlockHash, dispatch);
    }, [dispatch, setLatestBlockHash]);

    if (!accounts || !latestBlockHash) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            <Link to={routes.ACCOUNTCREATION}>
                <button type="button">+</button>
            </Link>
            <div className={styles.accountList}>
                {accounts.map((account, index) => (
                    <AccountListElement
                        account={account}
                        key={account.address}
                        latestBlockHash={latestBlockHash}
                        onClick={() => dispatch(chooseAccount(index))}
                        highlighted={index === chosenIndex}
                    />
                ))}
            </div>
        </div>
    );
}
