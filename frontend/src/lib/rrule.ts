import { RRule } from "rrule";

function getMonthNames(locale = "default", format: "long" | "short" = "long") {
  const months = [];
  for (let i = 0; i < 12; i++) {
    // Use a fixed year (e.g., 2024) to avoid issues with date validity around month ends
    const date = new Date(2024, i, 1);
    months.push(date.toLocaleString(locale, { month: format }));
  }
  return months;
}

function getWeekdayNames(
  locale = "default",
  format: "long" | "short" = "long",
) {
  const weekdays = [];
  for (let i = 0; i < 7; i++) {
    // Use a fixed date (e.g., Jan 1st, 2024 was a Monday) and add days
    const date = new Date(2024, 0, 1 + i);
    weekdays.push(date.toLocaleString(locale, { weekday: format }));
  }
  return weekdays;
}

export function formatRecurrence(rrule?: string | null) {
  if (!rrule) return "Sin recurrencia";
  try {
    const listFormat = new Intl.ListFormat("es", {
      style: "long",
      type: "conjunction",
    });
    const fullMonthNames = getMonthNames("es");
    const fullWeekdayNames = getWeekdayNames("es");
    const rule = RRule.fromString(rrule);
    const options = rule.options;

    const parts: string[] = [];

    // Frequency
    const freqMap: Record<number, string> = {
      [RRule.DAILY]: "diariamente",
      [RRule.WEEKLY]: "semanalmente",
      [RRule.MONTHLY]: "mensualmente",
      [RRule.YEARLY]: "anualmente",
    };
    if (options.freq in freqMap) {
      parts.push(freqMap[options.freq]);
    }

    // Interval
    if (options.interval && options.interval > 1) {
      parts.unshift(`Cada ${options.interval}`);
    }

    // Byweekday
    if (options.byweekday && options.byweekday.length > 0) {
      const days = listFormat.format(
        options.byweekday.map((d) => fullWeekdayNames[d]),
      );
      parts.push(`los ${days}`);
    }

    // Bymonth
    if (options.bymonth && options.bymonth.length > 0) {
      const months = listFormat.format(
        options.bymonth.map((m) => fullMonthNames[m - 1]),
      );
      parts.push(`en ${months}`);
    }

    // Until
    if (options.until) {
      const untilDate = options.until;
      const formattedDate = untilDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      parts.push(`hasta el ${formattedDate}`);
    }

    // Count
    if (options.count) {
      parts.push(`por ${options.count} veces`);
    }

    return parts.join(" ");
  } catch {
    return "Recurrencia no válida";
  }
}
