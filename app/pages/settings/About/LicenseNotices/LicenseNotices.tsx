import React, { useEffect } from 'react';
import { Redirect } from 'react-router';
import ipcCommands from '../../../../constants/ipcCommands.json';
import routes from '~/constants/routes.json';
import { licenseNotices } from '~/constants/urls.json';

/**
 * Component that will open the user's default browser on the
 * license notice webpage, and then redirect the user back to
 * the about page.
 */
export default function LicenseNotices() {
    useEffect(() => {
        window.ipcRenderer.invoke(ipcCommands.openUrl, licenseNotices);
    }, []);

    return <Redirect to={routes.SETTINGS_ABOUT} />;
}
