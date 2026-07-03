'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleData';
import { ReadingDay, DayNote, BibleStats } from '../types';
import { getReadingForDate } from '../utils/bibleUtils';

interface ReadingPlanContextType {
  readDates: string[];
  notes: Record<string, DayNote>;
  toggleRead: (dateStr: string) => void;
  saveNote: (dateStr: string, note: Partial<DayNote>) => void;
  stats: BibleStats;
  isMounted: boolean; // Pour éviter les problèmes d'hydratation Next.js avec LocalStorage
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  profile: { role: string } | null;
  signOut: () => Promise<void>;
}

const ReadingPlanContext = createContext<ReadingPlanContextType | undefined>(undefined);

export function ReadingPlanProvider({ children }: { children: React.ReactNode }) {
  const [readDates, setReadDates] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, DayNote>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);

  // Suivre la session utilisateur Supabase
  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.error("Erreur lors de la récupération du profil :", e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const syncWithSupabase = async (userId: string) => {
    try {
      // 1. Synchroniser la progression
      const { data: dbProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('date')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      const dbDates = dbProgress.map(p => p.date);
      // Fusionner : toutes les dates locales et distantes
      const mergedDates = Array.from(new Set([...readDates, ...dbDates]));
      
      // Mettre à jour l'état et le stockage local
      setReadDates(mergedDates);
      localStorage.setItem('sofitar_read_dates', JSON.stringify(mergedDates));

      // Sauvegarder les nouvelles dates locales en base de données
      const datesToInsert = readDates.filter(d => !dbDates.includes(d));
      if (datesToInsert.length > 0) {
        const rows = datesToInsert.map(date => ({ user_id: userId, date }));
        await supabase.from('user_progress').insert(rows);
      }

      // 2. Synchroniser les notes
      const { data: dbNotes, error: notesError } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId);

      if (notesError) throw notesError;

      const mergedNotes = { ...notes };
      const notesToUpsert: any[] = [];

      // Intégrer les notes distantes
      dbNotes.forEach(dbN => {
        const localN = notes[dbN.date];
        // Si la note distante est plus récente ou qu'on n'a pas de note locale
        if (!localN || new Date(dbN.updated_at) > new Date(localN.updatedAt)) {
          mergedNotes[dbN.date] = {
            date: dbN.date,
            summary: dbN.summary || '',
            verses: dbN.verses || '',
            prayer: dbN.prayer || '',
            decision: dbN.decision || '',
            application: dbN.application || '',
            updatedAt: dbN.updated_at
          };
        }
      });

      // Trouver les notes locales à envoyer sur Supabase
      Object.keys(notes).forEach(date => {
        const localN = notes[date];
        const dbN = dbNotes.find(n => n.date === date);
        if (!dbN || new Date(localN.updatedAt) > new Date(dbN.updated_at)) {
          notesToUpsert.push({
            user_id: userId,
            date: localN.date,
            summary: localN.summary,
            verses: localN.verses,
            prayer: localN.prayer,
            decision: localN.decision,
            application: localN.application,
            updated_at: localN.updatedAt
          });
        }
      });

      // Mettre à jour l'état et le stockage local
      setNotes(mergedNotes);
      localStorage.setItem('sofitar_notes', JSON.stringify(mergedNotes));

      // Sauvegarder sur Supabase
      if (notesToUpsert.length > 0) {
        await supabase.from('user_notes').upsert(notesToUpsert);
      }

    } catch (e) {
      console.error("Erreur lors de la synchronisation Supabase :", e);
    }
  };

  // Synchroniser à la connexion
  useEffect(() => {
    if (!isMounted) return;
    
    if (user) {
      syncWithSupabase(user.id);
    }
  }, [user, isMounted]);

  // Charger les données depuis LocalStorage au montage
  useEffect(() => {
    try {
      const storedReadDates = localStorage.getItem('sofitar_read_dates');
      if (storedReadDates) {
        setReadDates(JSON.parse(storedReadDates));
      }

      const storedNotes = localStorage.getItem('sofitar_notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }

      const storedTheme = localStorage.getItem('sofitar_theme');
      if (storedTheme) {
        setTheme(storedTheme as 'light' | 'dark');
      } else {
        // Préférence système
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.error('Erreur lors du chargement du LocalStorage', e);
    }
    setIsMounted(true);
  }, []);

  // Mettre à jour la classe CSS du document lors du changement de thème
  useEffect(() => {
    if (!isMounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sofitar_theme', theme);
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sauvegarder dans LocalStorage
  const saveReadDatesToStorage = (dates: string[]) => {
    try {
      localStorage.setItem('sofitar_read_dates', JSON.stringify(dates));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des dates', e);
    }
  };

  const saveNotesToStorage = (updatedNotes: Record<string, DayNote>) => {
    try {
      localStorage.setItem('sofitar_notes', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des notes', e);
    }
  };

  const toggleRead = async (dateStr: string) => {
    let newDates: string[];
    const isAdding = !readDates.includes(dateStr);
    
    if (isAdding) {
      newDates = [...readDates, dateStr];
    } else {
      newDates = readDates.filter(d => d !== dateStr);
    }
    
    setReadDates(newDates);
    saveReadDatesToStorage(newDates);

    // Écriture Supabase si connecté
    if (user) {
      try {
        if (isAdding) {
          await supabase.from('user_progress').insert({ user_id: user.id, date: dateStr });
        } else {
          await supabase.from('user_progress').delete().eq('user_id', user.id).eq('date', dateStr);
        }
      } catch (e) {
        console.error("Erreur d'écriture de progression sur Supabase :", e);
      }
    }
  };

  const saveNote = async (dateStr: string, noteData: Partial<DayNote>) => {
    const defaultNote: DayNote = {
      date: dateStr,
      summary: '',
      verses: '',
      prayer: '',
      decision: '',
      application: '',
      updatedAt: new Date().toISOString()
    };

    const existingNote = notes[dateStr] || defaultNote;
    const updatedNote: DayNote = {
      ...existingNote,
      ...noteData,
      date: dateStr,
      updatedAt: new Date().toISOString()
    };

    const newNotes = {
      ...notes,
      [dateStr]: updatedNote
    };

    setNotes(newNotes);
    saveNotesToStorage(newNotes);

    // Écriture Supabase si connecté
    if (user) {
      try {
        await supabase.from('user_notes').upsert({
          user_id: user.id,
          date: dateStr,
          summary: updatedNote.summary,
          verses: updatedNote.verses,
          prayer: updatedNote.prayer,
          decision: updatedNote.decision,
          application: updatedNote.application,
          updated_at: updatedNote.updatedAt
        });
      } catch (e) {
        console.error("Erreur d'écriture de note sur Supabase :", e);
      }
    }
  };

  // Calculer les statistiques de lecture (chapitres uniques lus)
  const calculateStats = (): BibleStats => {
    // Dictionnaire pour enregistrer les chapitres uniques lus par livre
    // ex: { 'genese': Set([1, 2, 5]) }
    const uniqueRead: Record<string, Set<number>> = {};

    readDates.forEach(dateStr => {
      const reading = getReadingForDate(dateStr);
      // Les dimanches ne sont pas des chapitres uniques
      if (reading.book && reading.chapter !== null) {
        const bookId = reading.book.id;
        if (!uniqueRead[bookId]) {
          uniqueRead[bookId] = new Set<number>();
        }
        uniqueRead[bookId].add(reading.chapter);
      }
    });

    // Compter par testament
    let otRead = 0;
    let ntRead = 0;
    const completedBooks: string[] = [];

    BIBLE_BOOKS.forEach(book => {
      const readChaptersSet = uniqueRead[book.id];
      const countRead = readChaptersSet ? readChaptersSet.size : 0;
      
      if (book.testament === 'OT') {
        otRead += countRead;
      } else {
        ntRead += countRead;
      }

      if (countRead === book.chapters) {
        completedBooks.push(book.name);
      }
    });

    const otTotal = 929;
    const ntTotal = 260;
    const totalRead = otRead + ntRead;
    const totalRemaining = (otTotal + ntTotal) - totalRead;

    return {
      totalRead,
      totalRemaining,
      percentGlobal: parseFloat(((totalRead / 1189) * 100).toFixed(1)),
      otRead,
      otTotal,
      otPercent: parseFloat(((otRead / otTotal) * 100).toFixed(1)),
      ntRead,
      ntTotal,
      ntPercent: parseFloat(((ntRead / ntTotal) * 100).toFixed(1)),
      completedBooks
    };
  };

  const stats = calculateStats();

  return (
    <ReadingPlanContext.Provider value={{ readDates, notes, toggleRead, saveNote, stats, isMounted, theme, toggleTheme, user, profile, signOut }}>
      {children}
    </ReadingPlanContext.Provider>
  );
}

export function useReadingPlanContext() {
  const context = useContext(ReadingPlanContext);
  if (context === undefined) {
    throw new Error('useReadingPlanContext doit être utilisé au sein de ReadingPlanProvider');
  }
  return context;
}
