import fakeIRO from './identity-request-object.json';
import exampleIRO from './valid_request.json';
import * as rust from'../..pkg';

const rustPkg = '';

export function createIdentityRequestObjectFake(ipInfo, arsInfos, global) {
    const input = {
        ipInfo,
        arsInfos,
        global: global.value,
    };
    console.log(input);
    return fakeIRO;
}

export async function createIdentityRequestObject(ipInfo, arsInfos, global) {
    const input = {
        ipInfo,
        arsInfos,
        global: global.value,
    };
    const input_str = JSON.stringify(input);
    console.log(input);
    const output_str = await rust.create_id_request_and_private_data_js(
        input_str
    );
    console.log(output_str);
    return JSON.parse(output_str);
}
