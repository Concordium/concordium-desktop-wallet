import 'regenerator-runtime/runtime';
import registerPromiseWorker from 'promise-worker/register';
import { parse } from './JSONHelper';
import workerCommands from '../constants/workerCommands.json';

interface RustInterface {
    buildPublicInformationForIp(
        context: string,
        idCredSec: string,
        prfKey: string
    ): string;
    createIdRequest(
        context: string,
        signature: string,
        idCredSec: string,
        prfKey: string
    ): string;
    generateUnsignedCredential(context: string): string;
    getDeploymentInfo(
        signature: string,
        unsignedInfo: string,
        expiry: bigint
    ): string;
    decrypt_amounts_ext(amounts: string): string;
}

let rustReference: RustInterface;
async function getRust(): Promise<RustInterface> {
    if (!rustReference) {
        rustReference = await import('@pkg/index');
    }
    return rustReference;
}

function buildPublicInformationForIp(
    rust: RustInterface,
    message: Record<string, string>
) {
    return rust.buildPublicInformationForIp(
        message.context,
        message.idCredSec,
        message.prfKey
    );
}

function createIdRequest(rust: RustInterface, message: Record<string, string>) {
    return rust.createIdRequest(
        message.context,
        message.signature,
        message.idCredSec,
        message.prfKey
    );
}

function createUnsignedCredential(
    rust: RustInterface,
    message: Record<string, string>
) {
    return rust.generateUnsignedCredential(message.input);
}

function createCredential(
    rust: RustInterface,
    message: Record<string, string>
) {
    return rust.getDeploymentInfo(
        message.signature,
        message.unsignedInfo,
        parse(message.expiry)
    );
}

function decryptAmounts(rust: RustInterface, message: Record<string, string>) {
    const decryptedAmounts = rust.decrypt_amounts_ext(message.input);
    return decryptedAmounts;
}

function mapCommand(command: string) {
    switch (command) {
        case workerCommands.buildPublicInformationForIp:
            return buildPublicInformationForIp;
        case workerCommands.createIdRequest:
            return createIdRequest;
        case workerCommands.createUnsignedCredential:
            return createUnsignedCredential;
        case workerCommands.createCredential:
            return createCredential;
        case workerCommands.decryptAmounts:
            return decryptAmounts;
        default:
            return () => 'unknown command';
    }
}

async function workerFunction(message: Record<string, string>) {
    const rust = await getRust();
    const func = mapCommand(message.command);
    return func(rust, message);
}

registerPromiseWorker(workerFunction);
