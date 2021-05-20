import { push } from 'connected-react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import routes from '../../constants/routes.json';

/**
 * The default page loaded on the base path. Always
 * forwards directly to the home page.
 */
export default function DefaultPage() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(push({ pathname: routes.HOME }));
    }, [dispatch]);
    return null;
}
