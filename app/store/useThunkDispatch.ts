import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from './store';

export default function useThunkDispatch() {
    const dispatch = useDispatch();
    return dispatch as ThunkDispatch<RootState, unknown, AnyAction>;
}
