import { PublicInformationForIP } from './types';

let rust;
async function getRust() {
    if (!rust) {
        rust = await import('../../pkg');
    }
    return rust;
}

export async function createIdentityRequestObjectAndPrivateData(ipInfo, arsInfos, global) {
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

export async function createIdentityRequestObjectLedger(
    ipInfo,
    arsInfos,
    global,
    prfKey,
    idCredSec,
    publicKeys,
    threshold
) {
    const rust = await getRust();
    const input = {
        ipInfo,
        arsInfos,
        global: global.value,
        prfKey,
        idCredSec,
        publicKeys,
        threshold,
    };

    function signFunction(info: PublicInformationForIP) {
        console.log(info);
        return "993fdc40bb8af4cb75caf8a53928d247be6285784b29578a06df312c28854c1bfac2fd0183967338b578772398d4120119b0f8cd36bc485a9cfcc5c98245acf34ce7474272b226149c81a1e0d293186e";
    }

    console.log("ledger version");
    const output = await rust.create_id_request_ext(JSON.stringify(input), signFunction);
    return JSON.parse(output);
}
