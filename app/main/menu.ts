import {
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    shell,
    dialog,
    app,
    MenuItem,
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
                    label: 'Terms and conditions',
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
                { type: 'separator' },
                {
                    label: 'Concordium support forum',
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

export function addContextMenu(window: BrowserWindow) {
    window.webContents.on('context-menu', (_, params) => {
        const menu = Menu.buildFromTemplate([
            { label: 'Cut', role: 'cut', enabled: params.editFlags.canCut },
            { label: 'Copy', role: 'copy', enabled: params.editFlags.canCopy },
            {
                label: 'Paste',
                role: 'paste',
                enabled: params.editFlags.canPaste,
            },
        ]);

        if (params.dictionarySuggestions.length > 0) {
            menu.append(new MenuItem({ type: 'separator' }));
        }

        // Add each spelling suggestion
        for (const suggestion of params.dictionarySuggestions) {
            menu.append(
                new MenuItem({
                    label: suggestion,
                    click: () =>
                        window.webContents.replaceMisspelling(suggestion),
                })
            );
        }

        // Allow users to add the misspelled word to the dictionary
        if (params.misspelledWord) {
            menu.append(new MenuItem({ type: 'separator' }));

            menu.append(
                new MenuItem({
                    label: 'Add to dictionary',
                    click: () =>
                        window.webContents.session.addWordToSpellCheckerDictionary(
                            params.misspelledWord
                        ),
                })
            );
        }

        menu.popup();
    });
}
