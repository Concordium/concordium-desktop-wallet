export enum Net {
    Mainnet,
    Staging,
    Testnet,
}

export function getTargetNet() {
    switch (process.env.TARGET_NET?.toLowerCase()) {
        case 'testnet':
            return Net.Testnet;
        case 'staging':
        default:
            return Net.Mainnet;
    }
}
