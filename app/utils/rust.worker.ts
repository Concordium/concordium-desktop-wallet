import registerPromiseWorker from 'promise-worker/register';
import workerCommands from '../constants/workerCommands.json';

let rustReference;
async function getRust() {
    if (!rustReference) {
        rustReference = await import('../../pkg');
    }
    return rustReference;
}

registerPromiseWorker(async function (message) {
    const rust = await getRust();
    // TODO use smarter switching if more commands are added;
    if (message.command === workerCommands.buildPublicInformationForIp) {
        const pubInfoForIpString = await rust.build_pub_info_for_ip_ext(
            message.context,
            message.idCredSec,
            message.prfKey
        );
        return pubInfoForIpString;
    }
    if (message.command === workerCommands.createIdRequest) {
        const idRequest = rust.create_id_request_ext(
            message.context,
            message.signature,
            message.idCredSec,
            message.prfKey
        );
        return idRequest;
    }
    return 'unknown command';
});
