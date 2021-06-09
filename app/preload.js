/* eslint-disable */
window.ipcRenderer = require('electron').ipcRenderer;

// TODO Rework to use the context bridge, when all functionality has been protected correctly.

// contextBridge.exposeInMainWorld(
//     "api", {
//         appGetPath: async () => {
//             return ipcRenderer.invoke("APP_GET_PATH");
//         }
//     }
// );
