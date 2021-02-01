import { partition } from '../../app/utils/basicHelpers';

test('Partition should split booleans correctly', () => {
    const list = [true, false, false, true, true, false, false];
    const [trueList, falseList] = partition(list, (x) => x);
    expect(trueList.every(Boolean)).toBe(true);
    expect(falseList.some(Boolean)).toBe(false);
    expect(trueList).toHaveLength(3);
    expect(falseList).toHaveLength(4);
});

test('Partition should split by length correctly', () => {
    const longString = 'aaaaa';
    const longSubList = [1, 1, 1, 1, 1];
    const list = ['a', 'aa', 'aaa', 'aaaa', longString, longSubList];
    const [longList, shortList] = partition(list, (x) => x.length > 4);
    expect(longList).toHaveLength(2);
    expect(shortList).toHaveLength(4);
    expect(longList).toContain(longSubList);
    expect(longList).toContain(longString);
});

test('Partition should handle all true', () => {
    const list = [true, true, true];
    const [trueList, falseList] = partition(list, (x) => x);
    expect(trueList).toHaveLength(3);
    expect(falseList).toHaveLength(0);
});
