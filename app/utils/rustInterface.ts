import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { PublicInformationForIP } from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';

let rust;
async function getRust() {
    if (!rust) {
        rust = await import('../../pkg');
    }
    return rust;
}

export async function createIdentityRequestObjectAndPrivateData(
    ipInfo,
    arsInfos,
    global
) {
    const rust = await getRust();
    const input = {
        ipInfo,
        arsInfos,
        global: global.value,
    };
    const inputString = JSON.stringify(input);
    const output = await rust.create_id_request_and_private_data_js(
        inputString
    );
    return JSON.parse(output);
}

function clean_bls(bls: String): String {
    console.log(bls);
    let hexString = bls.substring(3,bls.length - 1);
    console.log(hexString);
    return parseInt(hexString).toString();
}

export async function createIdentityRequestObjectLedger(
    ipInfo,
    arsInfos,
    global,
    displayMessage
) {
    const rust = await getRust();

    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    const identity = 3;

    displayMessage("Please confirm exporting prf key on device");
    const prfKey_seed = await ledger.getPrfKey(identity);

    displayMessage("Please confirm exporting id cred sec on device");
    const idCredSec_seed = await ledger.getIdCredSec(identity);

    const prfKey = prfKey_seed.toString('hex');
    const idCredSec = idCredSec_seed.toString('hex');
    displayMessage("Please wait");


    displayMessage("Please confirm exporting public key on device");
    const publicKey = await ledger.getPublicKey([0, 0, identity, 2, 0, 0]);
    displayMessage("Please wait");

    const context = {
        ipInfo,
        arsInfos,
        global: global.value,
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: publicKey.toString('hex'),
            },
        ],
        threshold: 1,
    };
    const contextString = JSON.stringify(context);
    console.log(context);
    const pubInfoForIpString = await rust.build_pub_info_for_ip_ext(
        contextString,
        idCredSec,
        prfKey,
    );
    console.log(pubInfoForIpString);
    const pubInfoForIp = JSON.parse(pubInfoForIpString);
    pubInfoForIp.pub.publicKeys.keys[0].verifyKey = "00" + pubInfoForIp.pub.publicKeys.keys[0].verifyKey // TODO: attach schemeId properly.

    const path = [0, 0, identity, 2, 0, 0];
    displayMessage("Please sign information on device");
    const signature = await ledger.signPublicInformationForIp(
        pubInfoForIp.pub,
        path
    );
    displayMessage("Please wait");
    const output = rust.create_id_request_ext(
        contextString,
        signature.toString('hex'),
        idCredSec,
        prfKey
    );
    console.log(output);
    return JSON.parse(output);
}
