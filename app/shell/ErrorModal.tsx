import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { errorSelector, closeModal } from '../features/ErrorSlice';
import ChoiceModal from '../components/ChoiceModal';

export default function ErrorModal() {
    const dispatch = useDispatch();
    const state = useSelector(errorSelector);
    return (
        <ChoiceModal
            title={state.title}
            description={state.description}
            actions={state.actions}
            open={state.open}
            postAction={() => dispatch(closeModal())}
        />
    );
}
