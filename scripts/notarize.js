/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin' || process.env.NOTARIZE === 'skip') {
        // eslint-disable-next-line no-console
        return console.log(
            'Not building for MacOS or for production, skipping notarization process.'
        );
    }

    if (
        !process.env.APPLEID ||
        !process.env.APPLEIDPASS ||
        !process.env.TEAMID
    ) {
        throw new Error(
            'The APPLEID, APPLEIDPASS or TEAMID environment variables used for notarizing the application was not set correctly.'
        );
    }

    const appName = context.packager.appInfo.productFilename;

    try {
        console.log('  • notarizing');
        return notarize({
            appBundleId: 'com.Concordium.Software.DesktopWallet',
            appPath: `${appOutDir}/${appName}.app`,
            appleId: process.env.APPLEID,
            appleIdPassword: process.env.APPLEIDPASS,
            teamId: process.env.TEAMID,
            ascProvider: 'K762RM4LQ3',
        });
    } catch (e) {
        return e;
    }
};
