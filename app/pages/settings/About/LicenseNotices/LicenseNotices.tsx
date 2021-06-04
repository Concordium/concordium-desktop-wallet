import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';

import { Redirect } from 'react-router';
import ipcCommands from '../../../../constants/ipcCommands.json';
import routes from '~/constants/routes.json';
import { licenseNotices } from '~/constants/urls.json';

export default function LicenseNotices() {
    useEffect(() => {
        ipcRenderer.invoke(ipcCommands.openUrl, licenseNotices);
    }, []);

    return <Redirect to={routes.SETTINGS_ABOUT} />;
}
