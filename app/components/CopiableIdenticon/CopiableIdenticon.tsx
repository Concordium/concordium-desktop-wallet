import React, { useRef } from 'react';
import Identicon from 'react-identicons';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useScreenshot } from 'use-react-screenshot';
import { clipboard, nativeImage } from 'electron';
import styles from './CopiableIdenticon.module.scss';

const imageWidth = 128;

interface Props {
    data: string;
}

function copyIdenticonToClipboard(dataUrl: string) {
    const image = nativeImage.createFromDataURL(dataUrl);
    return clipboard.writeImage(image);
}

/**
 * Component that displays a copiable identicon. Clicking the identicon will
 * copy the identicon to the clipboard as a PNG file.
 */
export default function CopiableIdenticon({ data }: Props) {
    const ref = useRef(null);
    const [image, takeScreenshot] = useScreenshot();
    const getImage = () => {
        takeScreenshot(ref.current);
    };

    if (image) {
        copyIdenticonToClipboard(image);
    }

    return (
        <>
            <h2>Identicon</h2>
            <h3 className={styles.copytext}>(Click to copy)</h3>
            <button
                ref={ref}
                className={styles.identicon}
                onClick={() => getImage()}
                type="button"
            >
                <Identicon string={data} size={imageWidth} />
            </button>
        </>
    );
}
