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
    return rust.buildPublicInformationForIp(
        message.context,
        message.idCredSec,
        message.prfKey
    );
}

function createIdRequest(rust, message) {
    return rust.createIdRequest(
        message.context,
        message.signature,
        message.idCredSec,
        message.prfKey
    );
}

function createUnsignedCredential(rust, message) {
    return rust.generateUnsignedCredential(message.input);
}

function createCredential(rust, message) {
    return rust.getDeploymentInfo(message.signature, message.unsignedInfo);
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
