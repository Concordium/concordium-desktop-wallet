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

/**
 * Displays the given message in a modal.
 */
export function informError(
    dispatch: Dispatch,
    title: string,
    description = '',
    action: Action = { label: 'ok thanks!' }
) {
    const error = {
        title,
        description,
        actions: [action],
        open: true,
    };
    dispatch(updateError(error));
}

/**
 * Displays a message, and allows multiple actions,
 * i.e. locations to redirect to.
 */
export function choiceError(
    dispatch: Dispatch,
    title: string,
    description: string,
    actions: Action[]
) {
    const error = {
        title,
        description,
        actions,
        open: true,
    };
    dispatch(updateError(error));
}

export default errorSlice.reducer;
