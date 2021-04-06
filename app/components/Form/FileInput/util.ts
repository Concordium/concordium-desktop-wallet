/* eslint-disable import/prefer-default-export */
import { notNull } from '~/utils/basicHelpers';

export const bytesFromKb = (kb: number): number => kb * 1024;

export const fileListToFileArray = (files: FileList | null): File[] =>
    new Array(files?.length ?? 0)
        .fill(0)
        .map((_, i) => files?.item(i))
        .filter(notNull);
