export const START_DATE_STR = '2026-06-29'; // Lundi 29 Juin 2026

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Mois 0-indexed en JS
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  // Travailler en UTC à midi pour éviter les problèmes d'heure d'été
  const d1Utc = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const d2Utc = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const diffMs = d1Utc - d2Utc;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function getWeekIndex(dateStr: string): number {
  const diff = getDaysDifference(dateStr, START_DATE_STR);
  return Math.floor(diff / 7) + 1;
}

export function getDayNumber(dateStr: string): number | null {
  const dayOfWeek = getDayOfWeek(dateStr);
  if (dayOfWeek === 6) {
    return null; // Pas de jour de lecture le dimanche (jour de révision)
  }
  const weekIndex = getWeekIndex(dateStr);
  return (weekIndex - 1) * 6 + dayOfWeek + 1;
}

export function getDayOfWeek(dateStr: string): number {
  // En JS, 0 = Dimanche, 1 = Lundi...
  // Nous voulons : 0 = Lundi, 1 = Mardi... 6 = Dimanche
  const date = parseDate(dateStr);
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getWeekDates(dateStr: string): string[] {
  const dayIndex = getDayOfWeek(dateStr);
  const monday = addDays(dateStr, -dayIndex);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatHumanDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formatted = formatter.format(date);
  // Mettre la première lettre en majuscule
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatHumanMonth(dateStr: string): string {
  const date = parseDate(dateStr);
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
