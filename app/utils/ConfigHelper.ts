export enum Net {
    Mainnet,
    Stagenet,
    Testnet,
}

export function getTargetNet() {
    switch (process.env.TARGET_NET?.toLowerCase()) {
        case 'testnet':
            return Net.Testnet;
        case 'stagenet':
            return Net.Stagenet;
        default:
            return Net.Mainnet;
    }
}
