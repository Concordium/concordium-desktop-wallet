import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import testReducer from './features/test/testSlice';
import accountReducer from './features/AccountSlice';
import identityReducer from './features/IdentitySlice';
import addressBookReducer from './features/AddressBookSlice';

export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        test: testReducer,
        identities: identityReducer,
        accounts: accountReducer,
        addressBook: addressBookReducer,
    });
}
