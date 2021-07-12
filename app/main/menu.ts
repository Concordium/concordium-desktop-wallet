import {
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    shell,
} from 'electron';
import { licenseNotices } from '~/constants/urls.json';
import { openRoute } from '~/constants/ipcRendererCommands.json';
import { TERMS } from '~/constants/routes.json';

const isMac = process.platform === 'darwin';

// eslint-disable-next-line import/prefer-default-export
export function createMenu(window: BrowserWindow) {
    const template: MenuItemConstructorOptions[] = [
        ...(isMac ? [{ role: 'appMenu' } as MenuItemConstructorOptions] : []),
        { role: 'fileMenu' },
        { role: 'editMenu' },
        {
            label: 'View',
            submenu: [
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        { role: 'windowMenu' },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Terms and Conditions',
                    click: () => {
                        window.webContents?.send(openRoute, TERMS);
                    },
                },
                {
                    label: 'License notices',
                    click: () => {
                        shell.openExternal(licenseNotices);
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
