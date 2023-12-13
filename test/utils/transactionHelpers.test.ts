import '../mockWindow';
import { AccountInfo } from '@concordium/web-sdk';
import {
    createRegularIntervalSchedule,
    validateBakerStake,
} from '../../app/utils/transactionHelpers';

test('createRegularIntervalSchedule release amounts should sum to input amount', () => {
    const totalAmount = 100n;
    const releases = 7;
    const schedule = createRegularIntervalSchedule(totalAmount, releases, 0, 0);
    expect(
        schedule.reduce((acc, { amount }) => acc + BigInt(amount), 0n)
    ).toEqual(totalAmount);
});

test('createRegularIntervalSchedule should put remainder onto last release', () => {
    const amount = 100n;
    const releases = 7;
    const schedule = createRegularIntervalSchedule(amount, releases, 0, 0);
    expect(BigInt(schedule[releases - 1].amount)).toEqual(
        (100n % 7n) + 100n / 7n
    );
});

test('createRegularIntervalSchedule should split amount equally, if the releases divide the amount', () => {
    const totalAmount = 100n;
    const releases = 5;
    const schedule = createRegularIntervalSchedule(totalAmount, releases, 0, 0);
    schedule.forEach((point) => expect(point.amount).toEqual('20'));
});

test('createRegularIntervalSchedule should increase timestamps by interval', () => {
    const interval = 3;
    const start = 5;
    const releases = 7;
    const schedule = createRegularIntervalSchedule(
        0n,
        releases,
        start,
        interval
    );
    expect(
        schedule.reduce(
            (acc, { timestamp }, index) =>
                acc && timestamp === (start + index * interval).toString(),
            true
        )
    ).toEqual(true);
});

test('validateBakerStake allows amount below threshold (if equal to currentStake)', () => {
    const stakedAmount = 1000000n; // microCCD (1 CCD)
    const accountAmount = 1000000000n; // microCCD (1000 CCD)
    const accountInfo = {
        accountAmount,
        accountBaker: { stakedAmount },
    } as AccountInfo;
    const threshold = 100000000n; // microCCD (100 CCD)
    const amount = '1'; // CCD
    expect(
        validateBakerStake(threshold, amount, accountInfo, 1n)
    ).toBeUndefined();
});

test('validateBakerStake does not allow amount below threshold (if not equal to currentStake)', () => {
    const stakedAmount = 1000000n; // microCCD (1 CCD)
    const accountAmount = 1000000000n; // microCCD (1000 CCD)
    const accountInfo = {
        accountAmount,
        accountBaker: { stakedAmount },
    } as AccountInfo;
    const threshold = 100000000n; // microCCD (100 CCD)
    const amount = '5'; // CCD
    expect(validateBakerStake(threshold, amount, accountInfo, 1n)).toContain(
        'below the threshold'
    );
});

test('validateBakerStake allows amount equal threshold', () => {
    const stakedAmount = 1000000n; // microCCD (1 CCD)
    const accountAmount = 1000000000n; // microCCD (1000 CCD)
    const accountInfo = {
        accountAmount,
        accountBaker: { stakedAmount },
    } as AccountInfo;
    const threshold = 100000000n; // microCCD (100 CCD)
    const amount = '100'; // CCD
    expect(
        validateBakerStake(threshold, amount, accountInfo, 1n)
    ).toBeUndefined();
});
