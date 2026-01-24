// eslint-disable-next-line no-restricted-imports
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
// eslint-disable-next-line no-restricted-imports
import moment from 'moment-timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

/**
 * Yes, wrapping dayjs is a bit annoying and might seem overly paranoid. However, I feel strongly
 * about not letting Dayjs instances leak into the rest of the codebase. Having Dayjs objects
 * floating around the application leads to inconsistent timezone handling, makes testing more
 * difficult, and creates subtle bugs that are hard to track down.
 * 
 * By wrapping dayjs completely and only exposing plain JavaScript Date objects, we get several
 * key benefits:
 * 1. Consistent timezone handling through a single configuration point
 * 2. Simpler testing since we only need to mock this one library
 * 3. Type safety - the rest of the codebase only deals with standard Date objects
 * 4. No risk of dayjs method chains creating unexpected timezone shifts
 * 
 * The Library interface gives us full control over all date operations while keeping the messy
 * details of timezone manipulation contained in one place. Yes it's more code, but the peace of
 * mind is worth it.
 */
export interface Utility {
    now: () => Date;
    date: (date: string | number | Date | null | undefined) => Date;
    parse: (date: string | number | Date | null | undefined, format: string) => Date;
    addDays: (date: Date, days: number) => Date;
    addWeeks: (date: Date, weeks: number) => Date;
    addMonths: (date: Date, months: number) => Date;
    addYears: (date: Date, years: number) => Date;
    format: (date: Date, format: string) => string;
    subDays: (date: Date, days: number) => Date;
    subWeeks: (date: Date, weeks: number) => Date;
    subMonths: (date: Date, months: number) => Date;
    subYears: (date: Date, years: number) => Date;
    startOfWeek: (date: Date) => Date;
    endOfWeek: (date: Date) => Date;
    startOfMonth: (date: Date) => Date;
    endOfMonth: (date: Date) => Date;
    startOfYear: (date: Date) => Date;
    endOfYear: (date: Date) => Date;
    getWeek: (date: Date) => number;
    getYear: (date: Date) => number;
    getISOWeek: (date: Date) => number;
    getISOWeekYear: (date: Date) => number;
    setWeek: (year: number, week: number) => Date;
    isBefore: (date: Date, other: Date) => boolean;
    isAfter: (date: Date, other: Date) => boolean;
}

export const create = (parameters: { timezone: string }) => {
    const { timezone } = parameters;
    const now = () => {
        return date(undefined);
    }

    const date = (date: string | number | Date | null | undefined) => {
        let value: dayjs.Dayjs;
        if (date) {
            value = dayjs.tz(date, timezone);
        } else {
            value = dayjs().tz(timezone);
        }

        if (!value.isValid()) {
            throw new Error(`Invalid date: ${date}`);
        }

        return value.toDate();
    }

    const parse = (date: string | number | Date | null | undefined, format: string) => {
        const value = dayjs.tz(date, format, timezone);
        if (!value.isValid()) {
            throw new Error(`Invalid date: ${date}, expected format: ${format}`);
        }

        return value.toDate();
    }

    const addDays = (date: Date, days: number) => {
        return dayjs.tz(date, timezone).add(days, 'day').toDate();
    }

    const addWeeks = (date: Date, weeks: number) => {
        return dayjs.tz(date, timezone).add(weeks, 'week').toDate();
    }

    const addMonths = (date: Date, months: number) => {
        return dayjs.tz(date, timezone).add(months, 'month').toDate();
    }

    const addYears = (date: Date, years: number) => {
        return dayjs.tz(date, timezone).add(years, 'year').toDate();
    }

    const format = (date: Date, format: string) => {
        return dayjs.tz(date, timezone).format(format);
    }

    const subDays = (date: Date, days: number) => {
        return dayjs.tz(date, timezone).subtract(days, 'day').toDate();
    }

    const subWeeks = (date: Date, weeks: number) => {
        return dayjs.tz(date, timezone).subtract(weeks, 'week').toDate();
    }

    const subMonths = (date: Date, months: number) => {
        return dayjs.tz(date, timezone).subtract(months, 'month').toDate();
    }

    const subYears = (date: Date, years: number) => {
        return dayjs.tz(date, timezone).subtract(years, 'year').toDate();
    }

    const startOfWeek = (date: Date) => {
        // ISO week starts on Monday, but we want Sunday as the start
        const d = dayjs.tz(date, timezone);
        const dayOfWeek = d.day(); // 0 = Sunday, 6 = Saturday
        return d.subtract(dayOfWeek, 'day').startOf('day').toDate();
    }

    const endOfWeek = (date: Date) => {
        // Week ends on Saturday
        const d = dayjs.tz(date, timezone);
        const dayOfWeek = d.day(); // 0 = Sunday, 6 = Saturday
        const daysUntilSaturday = 6 - dayOfWeek;
        return d.add(daysUntilSaturday, 'day').endOf('day').toDate();
    }

    const startOfMonth = (date: Date) => {
        return dayjs.tz(date, timezone).startOf('month').toDate();
    }

    const endOfMonth = (date: Date) => {
        return dayjs.tz(date, timezone).endOf('month').toDate();
    }

    const startOfYear = (date: Date) => {
        return dayjs.tz(date, timezone).startOf('year').toDate();
    }

    const endOfYear = (date: Date) => {
        return dayjs.tz(date, timezone).endOf('year').toDate();
    }

    const isBefore = (date: Date, other: Date) => {
        return dayjs.tz(date, timezone).isBefore(dayjs.tz(other, timezone));
    }

    const isAfter = (date: Date, other: Date) => {
        return dayjs.tz(date, timezone).isAfter(dayjs.tz(other, timezone));
    }

    const getWeek = (date: Date) => {
        // Custom week calculation: Sunday-based weeks
        const d = dayjs.tz(date, timezone);
        const startOfYearDate = d.startOf('year');
        const dayOfYear = d.diff(startOfYearDate, 'day');
        
        // Find the first Sunday of the year
        const firstDayOfYear = startOfYearDate.day(); // 0 = Sunday
        const daysUntilFirstSunday = firstDayOfYear === 0 ? 0 : 7 - firstDayOfYear;
        
        // Calculate week number (1-based)
        const daysSinceFirstSunday = dayOfYear - daysUntilFirstSunday;
        if (daysSinceFirstSunday < 0) {
            // Before first Sunday, this is week 0 (or last week of previous year)
            return 1;
        }
        return Math.floor(daysSinceFirstSunday / 7) + 1;
    }

    const getYear = (date: Date) => {
        return dayjs.tz(date, timezone).year();
    }

    const getISOWeek = (date: Date) => {
        return dayjs.tz(date, timezone).isoWeek();
    }

    const getISOWeekYear = (date: Date) => {
        return dayjs.tz(date, timezone).isoWeekYear();
    }

    const setWeek = (year: number, week: number) => {
        // Create a date for the given year and week (Sunday-based)
        const startOfYearDate = dayjs.tz(`${year}-01-01`, timezone);
        const firstDayOfYear = startOfYearDate.day(); // 0 = Sunday
        const daysUntilFirstSunday = firstDayOfYear === 0 ? 0 : 7 - firstDayOfYear;
        
        // Calculate the start of the requested week
        const targetDate = startOfYearDate.add(daysUntilFirstSunday + (week - 1) * 7, 'day');
        return targetDate.toDate();
    }

    return { 
        now, date, parse, 
        addDays, addWeeks, addMonths, addYears, 
        format, 
        subDays, subWeeks, subMonths, subYears, 
        startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, 
        getWeek, getYear, getISOWeek, getISOWeekYear, setWeek,
        isBefore, isAfter 
    };
}

export const validTimezones = () => {
    return moment.tz.names();
}
