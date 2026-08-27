import { useMemo } from 'react';
import { useSharedProps } from '@/lib/bootstrap';
import type { SharedData } from '@/types';

interface LocalizedDateProps {
    date: Date | string | number;
    showTime?: boolean;
    className?: string;
}

/**
 * Reads a cookie by name on the client side.
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop()?.split(';').shift() ?? '');
    }
    return null;
}

export function LocalizedDate({
    date,
    showTime = false,
    className,
}: LocalizedDateProps) {
    const props = useSharedProps();
    const locale = props.locale || 'en';

    const formattedDate = useMemo(() => {
        try {
            const d = new Date(date);
            if (Number.isNaN(d.getTime())) return 'Invalid Date';

            // Retrieve timezone from user_timezone cookie or fallback to browser's timezone
            const userTimezone =
                getCookie('user_timezone') ||
                getCookie('timezone') ||
                (typeof Intl !== 'undefined'
                    ? Intl.DateTimeFormat().resolvedOptions().timeZone
                    : 'UTC');

            const options: Intl.DateTimeFormatOptions = showTime
                ? {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: userTimezone,
                  }
                : {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      timeZone: userTimezone,
                  };

            const localeTag =
                locale === 'vi' ? 'vi-VN' : locale === 'my' ? 'my-MM' : 'en-US';
            return new Intl.DateTimeFormat(localeTag, options).format(d);
        } catch (e) {
            console.error('Error formatting date:', e);
            return typeof date === 'string' ? date : 'Invalid Date';
        }
    }, [date, showTime, locale]);

    return (
        <span
            className={className}
            id={`localized-date-${typeof date === 'string' ? date.replace(/[^a-zA-Z0-9]/g, '-') : 'val'}`}
        >
            {formattedDate}
        </span>
    );
}
