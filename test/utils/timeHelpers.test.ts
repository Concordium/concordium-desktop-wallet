import { getNextWholeHour } from '../../app/utils/timeHelpers';

test('test getNextWholeHour', () => {
    let date = new Date('December 17, 1995 03:24:00');
    let next = getNextWholeHour(date);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(4);

    date = new Date('December 17, 1995 03:47:20');
    next = getNextWholeHour(date);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(4);
});

test('test getNextWholeHour with hours to increase', () => {
    let date = new Date('December 17, 1995 03:24:00');
    let next = getNextWholeHour(date, 2);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(6);

    date = new Date('December 17, 1995 03:47:20');
    next = getNextWholeHour(date, 5);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(9);
});

test('test getNextWholeHour with whole hour', () => {
    let date = new Date('December 17, 1995 03:00:00');
    let next = getNextWholeHour(date);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(3);

    date = new Date('December 17, 1995 03:00:00');
    next = getNextWholeHour(date, 5);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMinutes()).toBe(0);
    expect(next.getHours()).toBe(8);
});
