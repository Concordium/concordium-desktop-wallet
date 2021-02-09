import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { Action, Dispatch } from '../utils/types';

interface ErrorState {
    title: string;
    description: string;
    actions: Action[];
    open: boolean;
}

const initialState: ErrorState = {
    title: '',
    description: '',
    actions: [],
    open: false,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        updateError: (state, input) => {
            Object.assign(state, input.payload);
        },
        closeModal: (state) => {
            state.open = false;
        },
    },
});

export const errorSelector = (state: RootState) => state.error;

export const { updateError, closeModal } = errorSlice.actions;

export function informError(
    dispatch: Dispatch,
    title: string,
    description = ''
) {
    const error = {
        title,
        description,
        actions: [
            {
                label: 'ok thanks!',
                onClick: () => {},
            },
        ],
        open: true,
    };
    dispatch(updateError(error));
}

export default errorSlice.reducer;
