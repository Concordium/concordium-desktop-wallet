import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

export default function Routes() {
  const sideBarElements = [];
  sideBarElements.push({ route: routes.TEST, title: 'Home' });
  sideBarElements.push({ route: routes.ACCOUNTS, title: 'Accounts' });
  sideBarElements.push({ route: routes.IDENTITIES, title: 'Identities' });
  sideBarElements.push({ route: routes.ADDRESSBOOK, title: 'Address Book' });
  sideBarElements.push({
    route: routes.EXPORTIMPORT,
    title: 'Export/Import',
  });
  sideBarElements.push({ route: routes.ADRESSBOOK, title: 'Address Book' });
  sideBarElements.push({
    route: routes.MULTISIGTRANSACTIONS,
    title: 'Multi Signature Transactions',
  });
  sideBarElements.push({ route: routes.SETTINGS, title: 'Settings' });
  return (
    <div>
      {sideBarElements.map((member, i) => (
        <Link to={member.route} key={i}>
          {member.title}{' '}
        </Link>
      ))}
    </div>
  );
}
