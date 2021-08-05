import { clipboard, nativeImage } from 'electron';

/**
 * Writes the image, provided as a data url, to the clipboard.
 */
function writeImageToClipboard(dataUrl: string) {
    const img = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(img);
}

export default writeImageToClipboard;
