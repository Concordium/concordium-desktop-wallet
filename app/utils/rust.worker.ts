import { parentPort } from "worker_threads";
import { PublicInformationForIP } from './types';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import  ConcordiumLedgerClient  from '../features/ledger/ConcordiumLedgerClient';

async function createIdentityRequestObject(input) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    async function signFunction(info: PublicInformationForIP) {
        console.log(info);
        const path = [0,0,0,2,0,0];
        return await ledger.signPublicInformationForIp(info,path);
    }

    const output = rust.create_id_request_ext(JSON.stringify(input), signFunction);
    parentPort.message('response', output);
}

parentPort.on('iro', input => {
    createIdentityRequestObject(input)
});

export default null as any;
