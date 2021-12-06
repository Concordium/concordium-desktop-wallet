export enum Net {
    Mainnet,
    Stagenet,
    Testnet,
}

export function getTargetNet() {
    switch (process.env.TARGET_NET) {
        case 'testnet':
            return Net.Testnet;
        case 'stagenet':
            return Net.Stagenet;
        case 'mainnet':
            return Net.Mainnet;
        default:
            throw new Error(
                `An invalid value for target net was set: [${process.env.TARGET_NET}]`
            );
    }
}

/**
 * Translates a net type into a human-readable display string
 */
export function displayTargetNet(net: Net) {
    switch (net) {
        case Net.Mainnet:
            return 'Mainnet';
        case Net.Stagenet:
            return 'Stagenet';
        case Net.Testnet:
            return 'Testnet';
        default:
            throw new Error(`An invalid net was provided: ${net}`);
    }
}
