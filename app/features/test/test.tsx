import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import {
    showBlockSummary,
    blockHashValue,
    blockSummary,
    sendTransfer,
    printCredentialDeployment,
    handleFieldChange,
    ledgerTest,
    publicInformationForIpTest,
} from './testSlice';

type ChangeHandler = (e: InputEvent) => void;

export default function Test() {
    const dispatch = useDispatch();
    const blockHash = useSelector(blockHashValue);
    const summary = useSelector(blockSummary);

    const onChanged: ChangeHandler = (e) => {
        dispatch(handleFieldChange(e.target.value));
    };

    return (
        <div>
            <div data-tid="backButton">
                <Link to={routes.HOME}>
                    <i className="fa fa-arrow-left fa-3x" />
                </Link>
            </div>
            <input
                name="blockHash"
                value={blockHash}
                onChange={onChanged}
                data-tid="hashInput"
            />
            <div>
                <button
                    onClick={() => {
                        showBlockSummary(dispatch, blockHash);
                    }}
                    data-tclass="btn"
                    type="button"
                >
                    getSummary
                </button>
                <button
                    onClick={() => {
                        sendTransfer();
                    }}
                    data-tclass="btn"
                    type="button"
                >
                    sendTransfer
                </button>
                <button
                    onClick={() => {
                        printCredentialDeployment();
                    }}
                    data-tclass="btn"
                    type="button"
                >
                    printCredentialDeployment
                </button>
                <button
                    onClick={() => {
                        ledgerTest();
                    }}
                    data-tclass="btn"
                    type="button"
                >
                    LedgerTest
                </button>
                <button
                    onClick={() => {
                        publicInformationForIpTest();
                    }}
                    data-tclass="btn"
                    type="button"
                >
                    PublicInfoForIpTest
                </button>
            </div>
            <textarea value={summary} readOnly />
        </div>
    );
}
