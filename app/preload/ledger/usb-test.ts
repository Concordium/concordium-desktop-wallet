import { usb } from 'usb';
import loggingMethods from '../logging';

/* eslint no-underscore-dangle: 0 */
usb._disableHotplugEvents();

function add(device: any) {
    loggingMethods.info(`Added USB device: ${JSON.stringify(device)}`);
}

function remove(device: any) {
    loggingMethods.info(`Removed USB device: ${JSON.stringify(device)}`);
}

export default function setupUsbListener() {
    usb.on('attach', add);
    usb.on('detach', remove);
}
