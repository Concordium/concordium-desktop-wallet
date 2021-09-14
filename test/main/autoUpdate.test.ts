/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { getVerificationFunctions } from '../../app/main/autoUpdate/verify';

jest.mock('axios');

describe('verifyChecksum', () => {
    const { verifyChecksum } = getVerificationFunctions({
        path: 'mockBinary.exe',
        downloadedFile: resolve(__dirname, './mocks/mockBinary.exe'),
        releaseName: 'test',
    } as any);

    (axios.get as jest.MockedFunction<any>).mockResolvedValue({
        data: readFileSync(
            resolve(__dirname, './mocks/mockBinary.exe.sha256sum')
        ).toString(),
    });

    test('Succeeds silently when locally produced checksum matches remote checksum', async () => {
        await expect(verifyChecksum()).resolves.toBe(undefined);
    });

    test('Throws error if checksums do not match', async () => {
        (axios.get as jest.MockedFunction<any>).mockResolvedValueOnce({
            data:
                '1230780d60b535e935abbe4c7d42e2d11fe04b56eb25e35050879b050b950c78',
        });

        // eslint-disable-next-line no-return-await
        await expect(verifyChecksum()).rejects.toThrow();
    });
});
