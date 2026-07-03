'use client';

import { useReadingPlanContext } from '../context/ReadingPlanContext';
import { getReadingForDate, generateReadingPlan } from '../utils/bibleUtils';
import { formatDate } from '../utils/dateUtils';
import { ReadingDay, DayNote } from '../types';

export function useReadingPlan() {
  const { readDates, notes, toggleRead, saveNote, stats, isMounted, theme, toggleTheme, user, profile, signOut } = useReadingPlanContext();

  const getTodayStr = (): string => {
    return formatDate(new Date());
  };

  const enrichDay = (day: ReadingDay, todayStr: string): ReadingDay => {
    // Si déjà lu
    if (readDates.includes(day.date)) {
      return { ...day, status: 'read' };
    }
    
    // Le dimanche reste en révision si non lu (ou on peut le cocher si on veut)
    if (day.isSunday) {
      return { ...day, status: 'review' };
    }

    // Sinon, déterminer en fonction d'aujourd'hui
    if (day.date < todayStr) {
      return { ...day, status: 'late' }; // Non lu et date passée
    } else {
      return { ...day, status: 'todo' }; // Non lu et aujourd'hui ou futur
    }
  };

  const getReadingDay = (dateStr: string): ReadingDay => {
    const rawDay = getReadingForDate(dateStr);
    return enrichDay(rawDay, getTodayStr());
  };

  const getDaysForPeriod = (startDateStr: string, endDateStr: string): ReadingDay[] => {
    const rawDays = generateReadingPlan(startDateStr, endDateStr);
    const todayStr = getTodayStr();
    return rawDays.map(day => enrichDay(day, todayStr));
  };

  const getDayNote = (dateStr: string): DayNote => {
    const defaultNote: DayNote = {
      date: dateStr,
      summary: '',
      verses: '',
      prayer: '',
      decision: '',
      application: '',
      updatedAt: ''
    };
    return notes[dateStr] || defaultNote;
  };

  const isRead = (dateStr: string): boolean => {
    return readDates.includes(dateStr);
  };

  return {
    isMounted,
    todayStr: getTodayStr(),
    stats,
    readDates,
    notes,
    getReadingDay,
    getDaysForPeriod,
    getDayNote,
    toggleRead,
    saveNote,
    isRead,
    theme,
    toggleTheme,
    user,
    profile,
    signOut
  };
}
