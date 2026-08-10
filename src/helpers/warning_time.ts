// src/helpers/warning_time.ts

import { localize } from "../localize/localize";
import {
  MeteoalarmAlert,
  MeteoalarmAlertKind,
  MeteoalarmAlertTiming,
} from "../types";

export interface WarningCaption {
  caption: string;
  prefixText?: string;
  prefixIcon?: string;
  suffixIcon?: string;
}

const CLOCK_ICON = "clock-outline";
//const END_ICON = 'clock-end';

/**
 * Creates the caption content for an alert.
 *
 * When showWarningTimes is disabled, expected warnings retain the existing
 * "Expected" caption and clock icon.
 *
 * When enabled:
 * - expected warnings display their start date/time and a trailing clock icon;
 * - current warnings display their end date/time and a leading end icon;
 * - full-day warnings display only the relevant day.
 */
export function formatWarningCaption(
  alert: MeteoalarmAlert,
  showWarningTimes = false,
  now: Date = new Date(),
): WarningCaption | undefined {
  if (!showWarningTimes) {
    return getLegacyCaption(alert);
  }

  if (alert.kind === MeteoalarmAlertKind.Expected) {
    return formatExpectedCaption(alert, now);
  }

  if (alert.kind === MeteoalarmAlertKind.Current) {
    return formatCurrentCaption(alert, now);
  }

  /*
   * Integrations without an explicit Current/Expected kind need to be
   * classified from their timestamps:
   *
   * - a future start date means an expected warning;
   * - otherwise, it is treated as an active/current warning.
   */
  if (alert.timing?.start) {
    const start = parseTimestamp(alert.timing.start);
    const notToday = start && getLocalDayDifference(start, now) > 0;

    if (start && notToday) {
      return formatExpectedCaption(alert, now);
    }
  }

  if (alert.timing?.start || alert.timing?.end) {
    return formatCurrentCaption(alert, now);
  }

  return undefined;
}

function getLegacyCaption(alert: MeteoalarmAlert): WarningCaption | undefined {
  if (alert.kind === MeteoalarmAlertKind.Expected) {
    return {
      caption: localize("common.expected"),
      suffixIcon: CLOCK_ICON,
    };
  }

  return undefined;
}

function formatExpectedCaption(
  alert: MeteoalarmAlert,
  now: Date,
): WarningCaption {
  const start = alert.timing?.start;

  if (!start) {
    return {
      caption: localize("common.expected"),
      suffixIcon: CLOCK_ICON,
    };
  }

  return {
    caption: formatTimingValue(start, alert.timing, now),
    suffixIcon: CLOCK_ICON,
  };
}

function formatCurrentCaption(
  alert: MeteoalarmAlert,
  now: Date,
): WarningCaption | undefined {
  const start = alert.timing?.start;
  const end = alert.timing?.end;

  const fullDay = isFullDayTiming(alert.timing);
  const parsedStart = start ? parseTimestamp(start) : undefined;
  const parsedEnd = end ? parseTimestamp(end) : undefined;
  const isToday = parsedEnd && getLocalDayDifference(parsedEnd, now) === 0;
  const isNow = parsedStart && parsedStart.getTime() < now.getTime();

  if (fullDay && isToday) {
    return {
      caption: localize("common.allday"),
    };
  }

  // No known end — alert is open-ended, just show when it started.
  if (!end) {
    return {
      caption: formatTimingValue(start!, alert.timing, now),
    };
  }

  if (isNow || !parsedStart) {
    return {
      caption: formatTimingValue(end, alert.timing, now),
      ...(fullDay ? {} : { prefixText: localize("common.until") }),
    };
  }

  return {
    caption: `${formatTimingValue(
      start!,
      alert.timing,
      now,
    )}–${formatTimingValue(end, alert.timing, now)}`,
  };
}

/**
 * Formats a timestamp as:
 *
 * Timed:
 * - 09:00
 * - Tomorrow 06:00
 * - Wed 18:00
 *
 * Full-day:
 * - Today
 * - Tomorrow
 * - Wed
 */
function formatTimingValue(
  value: string,
  timing: MeteoalarmAlertTiming | undefined,
  now: Date,
): string {
  const parsed = parseTimestamp(value);

  if (!parsed) {
    return value;
  }

  if (isFullDayTiming(timing)) {
    return formatDayReference(parsed, now);
  }

  const dayReference = getDayReference(parsed, now);
  const time = formatTime(parsed);

  return dayReference ? `${dayReference} ${time}` : time;
}

/**
 * Full-day warnings are represented by a complete same-day range:
 *
 * start:  YYYY-MM-DDT00:00:00...
 * end:    YYYY-MM-DDT23:59:00...
 *
 * The comparison uses local calendar components, matching the displayed
 * timezone and avoiding UTC/date-boundary errors.
 */
function isFullDayTiming(timing: MeteoalarmAlertTiming | undefined): boolean {
  if (!timing?.start || !timing.end) {
    return false;
  }

  const start = parseTimestamp(timing.start);
  const end = parseTimestamp(timing.end);

  if (!start || !end) {
    return false;
  }

  return (
    isSameLocalCalendarDay(start, end) &&
    isStartOfLocalDay(start) &&
    isEndOfFullDay(end)
  );
}

function isStartOfLocalDay(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

function isEndOfFullDay(date: Date): boolean {
  return date.getHours() === 23 && date.getMinutes() === 59;
}

function isSameLocalCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function parseTimestamp(value: string): Date | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value.trim());

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function formatDayReference(date: Date, now: Date): string {
  const dayDifference = getLocalDayDifference(date, now);

  if (dayDifference === 0) {
    return localizeDay("today");
  }

  if (dayDifference === 1) {
    return localizeDay("tomorrow");
  }

  return formatWeekday(date);
}

function getDayReference(date: Date, now: Date): string {
  const dayDifference = getLocalDayDifference(date, now);

  if (dayDifference === 0) {
    return "";
  }

  if (dayDifference === 1) {
    return localizeDay("tomorrow");
  }

  return formatWeekday(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat(getLocale(), {
    weekday: "short",
  }).format(date);
}

/**
 * Uses localized relative-day labels where available, with English fallback.
 *
 * The existing localization files currently contain "Expected", but not
 * necessarily "Today" and "Tomorrow". Keeping this fallback local prevents
 * the timing formatter from depending on additional translation keys.
 */
function localizeDay(day: "today" | "tomorrow"): string {
  const localized = localize(`common.${day}`);

  if (localized && localized !== `common.${day}`) {
    return localized;
  }

  return day === "today" ? "Today" : "Tomorrow";
}

function getLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

/**
 * Returns the difference between two local calendar dates.
 *
 * This deliberately compares calendar dates rather than elapsed 24-hour
 * periods, so daylight-saving-time transitions do not break Today/Tomorrow
 * formatting.
 */
function getLocalDayDifference(from: Date, to: Date): number {
  const fromDay = localCalendarDay(from);
  const toDay = localCalendarDay(to);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((fromDay - toDay) / millisecondsPerDay);
}

function localCalendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}
