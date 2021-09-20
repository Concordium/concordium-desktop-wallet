import axios, { AxiosRequestConfig } from 'axios';
import { createHash, verify } from 'crypto';
import { createReadStream, readFileSync } from 'fs';
import type { UpdateInfo } from 'electron-updater';

import { publicKeyUrl } from '~/constants/verification.json';
import { build } from '../../../package.json';

/**
 * UpdateInfo interface doesn't seem to be aligned with actual content.
 */
export interface RealUpdateInfo extends UpdateInfo {
    downloadedFile: string;
}

async function getRemoteContent(url: string, binary = false) {
    const options: AxiosRequestConfig = {};

    if (binary) {
        options.responseType = 'arraybuffer';
    }

    const { data } = await axios.get(url, options);
    return data;
}

function getSha256Sum(path: string): Promise<string> {
    const sum = createHash('sha256');
    const stream = createReadStream(path);

    stream.on('data', (data) => sum.update(data));

    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(sum.digest('hex')));
        stream.on('error', reject);
    });
}

const releasesFeed = `https://github.com/${build.publish.owner}/${build.publish.repo}/releases/download`;

// eslint-disable-next-line import/prefer-default-export
export function getVerificationFunctions({
    downloadedFile: filePath,
    releaseName,
    path: fileName,
}: RealUpdateInfo) {
    const releaseFileUrl = `${releasesFeed}/${releaseName}/${fileName}`;

    return {
        async verifyChecksum() {
            const remoteHash = await getRemoteContent(
                `${releaseFileUrl}.sha256sum`
            );
            const localHash = await getSha256Sum(filePath);

            if (localHash !== remoteHash) {
                throw new Error(
                    `Local checksum of update does not match remote checksum (local: ${localHash}, remote: ${remoteHash}).`
                );
            }
        },
        async verifySignature() {
            const [remoteSig, pubKey] = await Promise.all([
                getRemoteContent(`${releaseFileUrl}.sig`, true),
                getRemoteContent(publicKeyUrl),
            ]);

            const success = verify(
                null,
                readFileSync(filePath),
                Buffer.from(pubKey, 'ascii'),
                remoteSig
            );

            if (!success) {
                throw new Error('Signature verification failed.');
            }
        },
    };
}
