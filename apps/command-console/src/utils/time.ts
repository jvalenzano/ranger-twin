/**
 * Shared time utilities for RANGER
 */

// Timezone options relevant for USFS operations
export const TIMEZONE_OPTIONS = [
    { id: 'UTC', label: 'UTC', offset: 0 },
    { id: 'America/Los_Angeles', label: 'Pacific', offset: -8 },
    { id: 'America/Denver', label: 'Mountain', offset: -7 },
    { id: 'America/Chicago', label: 'Central', offset: -6 },
    { id: 'America/New_York', label: 'Eastern', offset: -5 },
    { id: 'America/Anchorage', label: 'Alaska', offset: -9 },
    { id: 'Pacific/Honolulu', label: 'Hawaii', offset: -10 },
] as const;

export type TimeZoneId = typeof TIMEZONE_OPTIONS[number]['id'];

// Format timestamp for a specific timezone
export const formatTimestamp = (timezoneId: string, date: Date = new Date()) => {
    try {
        return date.toLocaleTimeString('en-US', {
            timeZone: timezoneId,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    } catch {
        // Fallback to UTC if timezone is invalid
        return date.toISOString().slice(11, 19);
    }
};

// Get timezone abbreviation
export const getTimezoneAbbr = (timezoneId: string) => {
    const option = TIMEZONE_OPTIONS.find((tz) => tz.id === timezoneId);
    if (option) {
        return option.id === 'UTC' ? 'UTC' : option.label.slice(0, 3).toUpperCase();
    }
    return 'UTC';
};
