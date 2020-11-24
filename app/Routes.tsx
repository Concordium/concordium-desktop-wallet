/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import TestPage from './containers/TestPage';
import AccountsPage from './containers/AccountsPage';
import TodoPage from './containers/TodoPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.TEST} component={TestPage} />
        <Route path={routes.ACCOUNTS} component={AccountsPage} />
        <Route path={routes.IDENTITIES} component={TodoPage} />
        <Route path={routes.ADDRESSBOOK} component={TodoPage} />
        <Route path={routes.EXPORTIMPORT} component={TodoPage} />
        <Route path={routes.MULTISIGTRANSACTIONS} component={TodoPage} />
        <Route path={routes.SETTINGS} component={TodoPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
