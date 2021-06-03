import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';

import { Redirect } from 'react-router';
import ipcCommands from '../../../../constants/ipcCommands.json';
import routes from '~/constants/routes.json';

// TODO Update the link to the mainnet URL.
const licenseNoticesUrl = 'https://concordium.com/';

export default function LicenseNotices() {
    useEffect(() => {
        ipcRenderer.invoke(ipcCommands.openUrl, licenseNoticesUrl);
    }, []);

    return <Redirect to={routes.SETTINGS_ABOUT} />;
}
