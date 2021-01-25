// given a YearMonth string (YYYYMM), returns
// a displayable format eg:
// given "202001" => "January 2020"
export function formatDate(date: YearMonth) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}`));
}

