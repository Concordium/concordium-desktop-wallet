import React from 'react';
import jdenticon from 'jdenticon';
import { Image } from 'semantic-ui-react';

interface Props {
    hash: string;
}

/**
 * Given a hash, returns an element displaying
 * an identicon for that hash.
 */
export default function Identicon({ hash }: Props) {
    return <Image src={jdenticon.toSvg(hash, 200)} />;
}
