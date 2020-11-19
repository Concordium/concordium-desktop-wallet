import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import {
    showBlockSummary,
    blockHashValue,
    blockSummary,
    handleFieldChange
} from './testSlice';

type ChangeHandler = (e: InputEvent) => void

export default function Test() {
    const dispatch = useDispatch()
    const blockHash = useSelector(blockHashValue)
    const summary = useSelector(blockSummary)

    const onChanged: ChangeHandler = e => {
        dispatch(handleFieldChange(e.target.value));
    }

    return (
        <div>
            <div data-tid="backButton">
                <Link to={routes.HOME}>
                    <i className="fa fa-arrow-left fa-3x" />
                </Link>
            </div>
            <input name="blockHash" value={blockHash} onChange={onChanged} data-tid="hashInput">
            </input>
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
            </div>
            <textarea value={summary} readOnly={true}></textarea>
        </div>
    );
}
