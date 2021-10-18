import '../mockWindow';
import {
    getScheduledTransferPayloadSize,
    getTransactionEnergyCost,
    getTransactionKindEnergy,
    calculateCost,
    constantA,
    constantB,
    transactionHeaderSize,
    energyConstants,
} from '../../app/utils/transactionCosts';
import { TransactionKindId } from '../../app/utils/types';
import {
    createRegularIntervalSchedule,
    createScheduledTransferTransaction,
} from '../../app/utils/transactionHelpers';
import * as NodeRequests from '../../app/node/nodeRequests';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
} from '../../app/utils/transactionSerialization';

function getMockedScheduledTransfer(scheduleLength: number) {
    const address = '3UbdTrP5kcEioJRCyiCacAdpAYfyezPSVfrys8QDsHJUiVXjKf';
    const spy = jest.spyOn(NodeRequests, 'getNextAccountNonce');
    spy.mockReturnValue(Promise.resolve({ nonce: '0' }));
    return createScheduledTransferTransaction(
        address,
        address,
        createRegularIntervalSchedule(100n, scheduleLength, 0, 1),
        '1'
    );
}

/**
 * If these tests fail, check that they and the implementation are up to date with:
 * https://github.com/Concordium/concordium-base/blob/main/haskell-src/Concordium/Cost.hs
 */

test('calculateCost should do A * numKeys + B * transactionSize + typeCost', () => {
    const numKeys = 11n;
    const payloadSize = 233n;
    const transactionSize = payloadSize + transactionHeaderSize;
    const typeCost = 419n;
    const cost = constantA * numKeys + constantB * transactionSize + typeCost;
    expect(calculateCost(numKeys, payloadSize, typeCost) === cost).toBeTruthy();
});

test('getTransactionKindEnergy with simple transfer', () => {
    const transactionKind = TransactionKindId.Simple_transfer;
    const numKeys = 11;
    const payloadSize = 233;
    const transactionSize = BigInt(payloadSize) + transactionHeaderSize;
    const typeCost = energyConstants.SimpleTransferCost;
    const energy =
        constantA * BigInt(numKeys) + constantB * transactionSize + typeCost;
    expect(
        getTransactionKindEnergy(transactionKind, payloadSize, numKeys) ===
            energy
    ).toBeTruthy();
});

test('getTransactionEnergyCost with scheduled transfer', async () => {
    const scheduleLength = 23;
    const transaction = getMockedScheduledTransfer(scheduleLength);

    const numKeys = 11;
    const payloadSize = getScheduledTransferPayloadSize(scheduleLength, 0);
    const transactionSize = BigInt(payloadSize) + transactionHeaderSize;
    const typeCost =
        energyConstants.ScheduledTransferPerRelease * BigInt(scheduleLength);
    const energy =
        constantA * BigInt(numKeys) + constantB * transactionSize + typeCost;
    expect(
        getTransactionEnergyCost(transaction, numKeys) === energy
    ).toBeTruthy();
});

test('test TransactionHeaderSize', async () => {
    const scheduleLength = 23;
    const transaction = getMockedScheduledTransfer(scheduleLength);

    const serializedPayload = serializeTransferPayload(
        transaction.transactionKind,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        serializedPayload.length,
        transaction.expiry
    );

    expect(BigInt(header.length) === transactionHeaderSize).toBeTruthy();
});

test('test getScheduledTransferPayloadSize', async () => {
    const scheduleLength = 23;
    const transaction = getMockedScheduledTransfer(scheduleLength);

    const serializedPayload = serializeTransferPayload(
        transaction.transactionKind,
        transaction.payload
    );

    expect(
        serializedPayload.length ===
            getScheduledTransferPayloadSize(scheduleLength, 0)
    ).toBeTruthy();
});
