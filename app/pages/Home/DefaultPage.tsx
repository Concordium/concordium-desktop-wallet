import React from 'react';
import { Redirect } from 'react-router';
import routes from '../../constants/routes.json';

/**
 * The default page loaded on the base path. Always
 * forwards directly to the home page.
 */
export default function DefaultPage() {
    return <Redirect to={routes.HOME} />;
}
