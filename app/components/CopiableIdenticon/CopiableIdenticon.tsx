import React, { useEffect, useRef } from 'react';
import Identicon from 'react-identicons';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useScreenshot } from 'use-react-screenshot';
import { clipboard, nativeImage } from 'electron';
import styles from './CopiableIdenticon.module.scss';

const imageWidth = 128;

interface Props {
    data: string;
    setScreenshot?: (dataUrl: string) => void;
}

function copyIdenticonToClipboard(dataUrl: string) {
    const image = nativeImage.createFromDataURL(dataUrl);
    return clipboard.writeImage(image);
}

/**
 * Component that displays a copiable identicon. Clicking the identicon will
 * copy the identicon to the clipboard as a PNG file.
 */
export default function CopiableIdenticon({ data, setScreenshot }: Props) {
    const ref = useRef(null);
    const [image, takeScreenshot] = useScreenshot();

    // Take a screenshot of the identicon after the component has rendered
    // the first time.
    useEffect(() => {
        if (!image) {
            takeScreenshot(ref.current);
        } else if (setScreenshot) {
            setScreenshot(image);
        }
    }, [image, takeScreenshot, setScreenshot]);

    return (
        <>
            <h5>
                Identicon
                <div className={styles.copytext}>(Click to export)</div>
            </h5>
            <button
                ref={ref}
                className={styles.identicon}
                onClick={() => copyIdenticonToClipboard(image)}
                type="button"
            >
                <Identicon string={data} size={imageWidth} />
            </button>
        </>
    );
}
