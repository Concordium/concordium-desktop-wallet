import { partition } from '../../app/utils/basicHelpers';

test('Partition should split booleans correctly', () => {
    const list = [true, false, false, true, true, false, false];
    const [trueList, falseList] = partition(list, (x) => x);
    expect(trueList.every(Boolean)).toBe(true);
    expect(falseList.some(Boolean)).toBe(false);
    expect(trueList).toHaveLength(3);
    expect(falseList).toHaveLength(4);
});
