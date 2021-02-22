import { createSchedule } from '../../app/utils/transactionHelpers';

test('createSchedule release amounts should sum to input amount', () => {
    const totalAmount = 100n;
    const releases = 7;
    const schedule = createSchedule(totalAmount, releases, 0, 0);
    expect(
        schedule.reduce((acc, { amount }) => acc + BigInt(amount), 0n)
    ).toEqual(totalAmount);
});

test('createSchedule should put remainder onto last release', () => {
    const amount = 100n;
    const releases = 7;
    const schedule = createSchedule(amount, releases, 0, 0);
    expect(BigInt(schedule[releases - 1].amount)).toEqual(
        (100n % 7n) + 100n / 7n
    );
});

test('createSchedule should split amount equally, if the releases divide the amount', () => {
    const totalAmount = 100n;
    const releases = 5;
    const schedule = createSchedule(totalAmount, releases, 0, 0);
    schedule.forEach((point) => expect(point.amount).toEqual('20'));
});

test('createSchedule should increase timestamps by interval', () => {
    const interval = 3;
    const start = 5;
    const releases = 7;
    const schedule = createSchedule(0n, releases, start, interval);
    expect(
        schedule.reduce(
            (acc, { timestamp }, index) =>
                acc && timestamp === (start + index * interval).toString(),
            true
        )
    ).toEqual(true);
});
