import { Action, Reducer } from 'redux';

enum ModalActionType {
    OPEN,
    CLOSE,
    CLOSED,
}

type OpenAction = Action<ModalActionType.OPEN>;
export const openAction = (): OpenAction => ({ type: ModalActionType.OPEN });

type CloseAction = Action<ModalActionType.CLOSE>;
export const closeAction = (): CloseAction => ({ type: ModalActionType.CLOSE });

type ClosedAction = Action<ModalActionType.CLOSED>;
export const closedAction = (): ClosedAction => ({
    type: ModalActionType.CLOSED,
});

interface ModalState {
    isOpen: boolean;
    isExiting: boolean;
}

type ModalAction = OpenAction | CloseAction | ClosedAction;

const initialState: ModalState = {
    isExiting: false,
    isOpen: false,
};

export const modalReducer: Reducer<ModalState, ModalAction> = (
    s = initialState,
    a
) => {
    switch (a.type) {
        case ModalActionType.OPEN:
            return {
                isExiting: false,
                isOpen: true,
            };
        case ModalActionType.CLOSE:
            return { ...s, isExiting: true };
        case ModalActionType.CLOSED:
            return { isExiting: false, isOpen: false };
        default:
            return s;
    }
};
