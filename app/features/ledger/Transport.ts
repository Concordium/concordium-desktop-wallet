import type HWTransport from '@ledgerhq/hw-transport';
import { Buffer as BrowserBuffer } from 'buffer/';
import ClosedWhileSendingError from './ClosedWhileSendingError';

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
}
