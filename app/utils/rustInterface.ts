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

    return new Promise((resolve, reject) => {
        console.log("ledger version");
        var worker = new Worker('./rust.worker');
        worker.on('response', message => resolve(JSON.parse(message)));
        worker.postMessage('iro', JSON.stringify(input));
    });
}

