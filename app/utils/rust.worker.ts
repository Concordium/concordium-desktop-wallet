import registerPromiseWorker from 'promise-worker/register';
import workerCommands from '../constants/workerCommands.json';

let rustReference;
async function getRust() {
    if (!rustReference) {
        rustReference = await import('../../pkg');
    }
    return rustReference;
}

function buildPublicInformationForIp(rust, message) {
    const pubInfoForIpString = rust.build_pub_info_for_ip_ext(
        message.context,
        message.idCredSec,
        message.prfKey
    );
    return pubInfoForIpString;
}

function createIdRequest(rust, message) {
    const idRequest = rust.create_id_request_ext(
        message.context,
        message.signature,
        message.idCredSec,
        message.prfKey
    );
    return idRequest;
}

function createUnsignedCredential(rust, message) {
    const unsignedCredential = rust.generate_unsigned_credential_ext(
        message.input
    );
    return unsignedCredential;
}

function createCredential(rust, message) {
    const credential = rust.get_credential_deployment_info_ext(
        message.signature,
        message.unsignedInfo
    );
    return credential;
}

function mapCommand(command) {
    switch (command) {
        case workerCommands.buildPublicInformationForIp:
            return buildPublicInformationForIp;
        case workerCommands.createIdRequest:
            return createIdRequest;
        case workerCommands.createUnsignedCredential:
            return createUnsignedCredential;
        case workerCommands.createCredential:
            return createCredential;
        default:
            return () => 'unknown command';
    }
}

async function workerFunction(message) {
    const rust = await getRust();
    const func = mapCommand(message.command);
    return func(rust, message);
}

registerPromiseWorker(workerFunction);
