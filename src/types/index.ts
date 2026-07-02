import { BibleBook } from '../data/bibleData';

export interface ChapterInfo {
  bookName: string;
  bookAbbr: string;
  chapter: number;
}

export interface ReadingDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Lundi) à 6 (Dimanche)
  weekIndex: number; // Index de semaine de défi (1-based)
  testament: 'OT' | 'NT';
  book: BibleBook | null; // null si Dimanche (jour de révision)
  chapter: number | null; // null si Dimanche
  isSunday: boolean;
  status: 'todo' | 'read' | 'late' | 'review';
  chaptersToReview: ChapterInfo[] | null; // Rempli uniquement le Dimanche (6 chapitres du Lundi au Samedi)
  label: string; // ex: "Genèse 1" ou "Révision"
  url: string; // URL vers AELF pour la lecture (chaîne vide pour le dimanche)
}

export interface DayNote {
  date: string;
  summary: string;     // Résumé / Ce que Dieu m'a enseigné
  verses: string;      // Versets importants
  prayer: string;      // Prière
  decision: string;    // Décision
  application: string; // Applications personnelles
  updatedAt: string;
}

export interface BibleStats {
  totalRead: number;
  totalRemaining: number;
  percentGlobal: number;
  otRead: number;
  otTotal: number;
  otPercent: number;
  ntRead: number;
  ntTotal: number;
  ntPercent: number;
  completedBooks: string[]; // Liste des noms des livres terminés
}
