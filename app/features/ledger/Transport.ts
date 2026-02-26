import type HWTransport from '@ledgerhq/hw-transport';
import { Buffer as BrowserBuffer } from 'buffer/';
import ClosedWhileSendingError from './ClosedWhileSendingError';
import LedgerTimeoutError from './LedgerTimeoutError';

/** Default time to wait for a single APDU response before giving up. */
export const LEDGER_SEND_TIMEOUT_MS = 30_000;

export type Transport = {
    close: () => Promise<void>;
    send: (
        cla: number,
        ins: number,
        p1: number,
        p2: number,
        data?: BrowserBuffer
    ) => Promise<BrowserBuffer>;
    closed: boolean;
};

export class TransportImpl implements Transport {
    transport: HWTransport;

    closed: boolean;

    constructor(transport: HWTransport) {
        this.transport = transport;
        this.closed = false;
    }

    async close() {
        this.closed = true;
        // Actually release the hardware HID handle so subsequent openTransport()
        // calls from the observer don't race with a still-open descriptor.
        await this.transport.close();
    }

    async send(
        cla: number,
        ins: number,
        p1: number,
        p2: number,
        data?: BrowserBuffer
    ) {
        this.closed = false;
        try {
            let dataAsNodeBuffer: Buffer | undefined;
            if (data) {
                dataAsNodeBuffer = Buffer.from(data);
            }
            const response = await this.transport.send(
                cla,
                ins,
                p1,
                p2,
                dataAsNodeBuffer
            );
            if (this.closed) {
                throw new ClosedWhileSendingError();
            } else {
                return BrowserBuffer.from(new Uint8Array(response));
            }
        } catch (e) {
            if (this.closed) {
                throw new ClosedWhileSendingError();
            } else {
                throw e;
            }
        }
    }

    /**
     * Wraps {@link send} with a hard timeout. Throws {@link LedgerTimeoutError}
     * if the device does not respond within {@link timeoutMs} milliseconds.
     * This prevents the app from hanging indefinitely on unresponsive devices.
     */
    async sendWithTimeout(
        cla: number,
        ins: number,
        p1: number,
        p2: number,
        data?: BrowserBuffer,
        timeoutMs = LEDGER_SEND_TIMEOUT_MS
    ): Promise<BrowserBuffer> {
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        const timeout = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(
                () => reject(new LedgerTimeoutError(timeoutMs)),
                timeoutMs
            );
        });
        try {
            const result = await Promise.race([
                this.send(cla, ins, p1, p2, data),
                timeout,
            ]);
            return result;
        } finally {
            if (timeoutHandle !== undefined) {
                clearTimeout(timeoutHandle);
            }
        }
    }
}
