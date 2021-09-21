import {
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    shell,
    dialog,
    app,
} from 'electron';
import { licenseNotices, supportForum } from '~/constants/urls.json';
import { openRoute } from '~/constants/ipcRendererCommands.json';
import { TERMS } from '~/constants/routes.json';

const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

const aboutMessageSpace = '            ';

// eslint-disable-next-line import/prefer-default-export
export function createMenu(window: BrowserWindow) {
    const aboutMenuItem: MenuItemConstructorOptions = isLinux
        ? {
              label: 'About',
              click: () =>
                  dialog.showMessageBox(window, {
                      message: `${aboutMessageSpace}Version ${app.getVersion()}${aboutMessageSpace}`,
                      title: app.getName(),
                      type: 'none',
                  }),
          }
        : { role: 'about' };

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
        ...(isMac
            ? [{ role: 'windowMenu' } as MenuItemConstructorOptions]
            : []),
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
                    label: 'License Notices',
                    click: () => {
                        shell.openExternal(licenseNotices);
                    },
                },
                { type: 'separator' },
                {
                    label: 'Concordium Support Forum',
                    click: () => {
                        shell.openExternal(supportForum);
                    },
                },
                ...(isMac
                    ? []
                    : ([
                          { type: 'separator' },
                          aboutMenuItem,
                      ] as MenuItemConstructorOptions[])),
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
