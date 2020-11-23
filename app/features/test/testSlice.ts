import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import { getBlockSummary, sendTransaction } from '../../utils/client';
import { serializeTransaction } from '../../utils/transactionSerialization';

import data from './transfer.json';

const testSlice = createSlice({
  name: 'test',
  initialState: {
    blockHash:
      '489aea825843bb96b7e09b8a69bd6d70ace9949dd385801060801dd3c1533bee',
    summary: '',
  },
  reducers: {
    handleFieldChange: (state, payload) => {
      state.blockHash = payload.payload;
    },
    updateSummary: (state, newSummary) => {
      state.summary = newSummary.payload;
    },
  },
});

export const blockHashValue = (state: RootState) => state.test.blockHash;

export const blockSummary = (state: RootState) => state.test.summary;

export const { handleFieldChange, updateSummary } = testSlice.actions;

export async function showBlockSummary(dispatch, blockHash) {
  return getBlockSummary(blockHash)
    .catch((error) => console.log(error))
    .then((response) =>
      dispatch(updateSummary(JSON.stringify(response, null, 3)))
    );
}

export async function sendTransfer() {
  const payload = serializeTransaction(data);

  printAsHex(payload);

  sendTransaction(payload)
    .catch((error) => console.log(error))
    .then((response) => console.log(response));
}

function printAsHex(array) {
  console.log(Buffer.from(array).toString('hex'));
}

export default testSlice.reducer;
