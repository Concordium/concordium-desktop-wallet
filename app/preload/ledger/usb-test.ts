import { usb } from 'usb';
import loggingMethods from '../logging';

function add() {
    loggingMethods.info('Added USB device!');
}

function remove() {
    loggingMethods.info('Removed USB device!');
}

export default function setupUsbListener() {
    usb.on('attach', add);
    usb.on('detach', remove);
}
