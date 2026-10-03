import { addDays, format, nextDay, type Day } from "date-fns";
import type { Priority } from "@/types";

export type ParsedQuickAdd = {
  title: string;
  dueDate: string | null; // YYYY-MM-DD
  priority: Priority | null;
  tagNames: string[];
};

const WEEKDAYS: Record<string, Day> = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, thursday: 4, thu: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6,
};

/**
 * Pulls a due date, a priority and #tags out of a typed task line, e.g.
 * "Finish DSA assignment tomorrow #college !high" ->
 * { title: "Finish DSA assignment", dueDate: <tomorrow>, priority: "high", tagNames: ["college"] }
 * Anything it doesn't recognise is left in the title untouched.
 */
export function parseQuickAdd(input: string, today = new Date()): ParsedQuickAdd {
  let text = input;
  let dueDate: string | null = null;
  let priority: Priority | null = null;
  const tagNames: string[] = [];

  text = text.replace(/#(\w+)/g, (_, tag) => {
    tagNames.push(tag.toLowerCase());
    return "";
  });

  text = text.replace(/!(low|medium|med|high)\b/i, (_, p) => {
    priority = (p.toLowerCase() === "med" ? "medium" : p.toLowerCase()) as Priority;
    return "";
  });

  const iso = (d: Date) => format(d, "yyyy-MM-dd");
  const dateRules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/\btoday\b/i, () => iso(today)],
    [/\btomorrow\b/i, () => iso(addDays(today, 1))],
    [/\bday after tomorrow\b/i, () => iso(addDays(today, 2))],
    [/\bnext week\b/i, () => iso(addDays(today, 7))],
    [
      /\b(?:next\s+)?(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat)\b/i,
      (m) => iso(nextDay(today, WEEKDAYS[m[1].toLowerCase()])),
    ],
  ];
  for (const [re, toDate] of dateRules) {
    const m = text.match(re);
    if (m) {
      dueDate = toDate(m);
      text = text.replace(re, "");
      break;
    }
  }

  return { title: text.replace(/\s+/g, " ").trim(), dueDate, priority, tagNames };
}
