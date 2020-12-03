export async function createIdentityRequestObject(ipInfo, arsInfos, global) {
    const rust = await import('../../pkg');
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
