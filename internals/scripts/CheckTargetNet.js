module.exports = function CheckTargetNet() {
    if (
        process.env.TARGET_NET &&
        !['stagenet', 'testnet', 'protonet', 'mainnet'].includes(
            process.env.TARGET_NET
        )
    ) {
        throw new Error(
            `Unknown TARGET_NET. Only [stagenet, testnet, protonet, mainnet] are allowed values. Given: ${process.env.TARGET_NET}`
        );
    }
};
