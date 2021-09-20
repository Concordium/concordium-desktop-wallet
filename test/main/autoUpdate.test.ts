/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { getVerificationFunctions } from '../../app/main/autoUpdate/verify';

jest.mock('axios');
type AxiosGetMock = jest.MockedFunction<
    (url: string) => Promise<Partial<AxiosResponse>>
>;

const { verifyChecksum, verifySignature } = getVerificationFunctions({
    path: 'binary.exe',
    downloadedFile: resolve(__dirname, './mocks/binary.exe'),
    releaseName: 'test',
} as any);

describe(verifyChecksum, () => {
    test('Succeeds silently when locally produced checksum matches remote checksum', async () => {
        (axios.get as AxiosGetMock).mockResolvedValue({
            data: readFileSync(
                resolve(__dirname, './mocks/binary.exe.sha256sum')
            ).toString(),
        });

        await expect(verifyChecksum()).resolves.toBe(undefined);
    });

    test('Throws error if checksums do not match', async () => {
        (axios.get as AxiosGetMock).mockResolvedValue({
            data:
                '1230780d60b535e935abbe4c7d42e2d11fe04b56eb25e35050879b050b950c78',
        });

        // eslint-disable-next-line no-return-await
        await expect(verifyChecksum()).rejects.toThrow();
    });
});

describe(verifySignature, () => {
    const sigPromise = Promise.resolve({
        data: readFileSync(resolve(__dirname, './mocks/binary.exe.sig')),
    });
    const pubPromise = Promise.resolve({
        data: readFileSync(resolve(__dirname, './mocks/public.pem')),
    });

    test('Succeeds silently when valid signature is verified with valid public key', async () => {
        (axios.get as AxiosGetMock).mockImplementation((url: string) => {
            if (url.endsWith('.sig')) {
                return sigPromise;
            }
            return pubPromise;
        });

        await expect(verifySignature()).resolves.toBe(undefined);
    });

    test('Throws with invalid public key', async () => {
        (axios.get as AxiosGetMock).mockImplementation((url: string) => {
            if (url.endsWith('.sig')) {
                return sigPromise;
            }
            return Promise.resolve({ data: Buffer.from('123') });
        });
        await expect(verifySignature()).rejects.toThrow();
    });

    test('Throws with invalid signature', async () => {
        (axios.get as AxiosGetMock).mockImplementation((url: string) => {
            if (url.endsWith('.sig')) {
                return Promise.resolve({ data: Buffer.from('123') });
            }
            return pubPromise;
        });
        await expect(verifySignature()).rejects.toThrow();
    });
});
