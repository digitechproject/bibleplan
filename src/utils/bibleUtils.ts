import { BIBLE_BOOKS, BibleBook, OT_BOOKS, NT_BOOKS, TOTAL_OT_CHAPTERS, TOTAL_NT_CHAPTERS } from '../data/bibleData';
import { getWeekIndex, getDayOfWeek, addDays, getDayNumber } from './dateUtils';
import { ReadingDay, ChapterInfo } from '../types';

/**
 * Convertit un index de chapitre cumulé (1-based) en livre et chapitre réels
 * pour un testament donné, avec rebouclage automatique.
 */
export function getChapterFromCumulativeIndex(
  cumulativeIndex: number,
  testament: 'OT' | 'NT'
): { book: BibleBook; chapter: number } {
  const books = testament === 'OT' ? OT_BOOKS : NT_BOOKS;
  const totalChapters = testament === 'OT' ? TOTAL_OT_CHAPTERS : TOTAL_NT_CHAPTERS;

  // Rebouclage automatique (1-based)
  const normalizedIndex = ((cumulativeIndex - 1) % totalChapters) + 1;

  let currentSum = 0;
  for (const book of books) {
    if (normalizedIndex <= currentSum + book.chapters) {
      return {
        book,
        chapter: normalizedIndex - currentSum
      };
    }
    currentSum += book.chapters;
  }

  // Fallback de sécurité (ne devrait jamais être atteint)
  return { book: books[0], chapter: 1 };
}

/**
 * Calcule la lecture pour une date spécifique
 */
export function getReadingForDate(dateStr: string): ReadingDay {
  const weekIndex = getWeekIndex(dateStr);
  const dayOfWeek = getDayOfWeek(dateStr); // 0 = Lundi, ..., 6 = Dimanche
  const dayNumber = getDayNumber(dateStr);
  const isSunday = dayOfWeek === 6;

  // Semaine impaire => Ancien Testament, Semaine paire => Nouveau Testament
  const isOtWeek = weekIndex % 2 !== 0;
  const testament = isOtWeek ? 'OT' : 'NT';

  if (isSunday) {
    // Le dimanche est un jour de révision des 6 chapitres lus du lundi au samedi de cette semaine
    const chaptersToReview: ChapterInfo[] = [];
    
    // On simule les 6 jours précédents de la semaine (lundi à samedi)
    for (let d = 0; d < 6; d++) {
      const dayOffset = d - 6; // Lundi = -6 jours, Samedi = -1 jour par rapport au Dimanche
      const targetDate = addDays(dateStr, dayOffset);
      const targetWeek = getWeekIndex(targetDate);
      const targetDayOfWeek = getDayOfWeek(targetDate);
      
      // Sécurité : s'assurer qu'on reste sur le même type de testament et la même semaine de défi
      const targetWeekIndex = targetWeek;
      const targetIsOt = targetWeekIndex % 2 !== 0;
      const targetTestament = targetIsOt ? 'OT' : 'NT';
      
      const k = targetIsOt ? Math.floor((targetWeekIndex + 1) / 2) : Math.floor(targetWeekIndex / 2);
      const cumIndex = (k - 1) * 6 + targetDayOfWeek + 1;
      
      const { book, chapter } = getChapterFromCumulativeIndex(cumIndex, targetTestament);
      
      chaptersToReview.push({
        bookName: book.name,
        bookAbbr: book.aelfAbbr,
        chapter
      });
    }

    return {
      date: dateStr,
      dayOfWeek,
      weekIndex,
      dayNumber,
      testament,
      book: null,
      chapter: null,
      isSunday: true,
      status: 'review',
      chaptersToReview,
      label: 'Révision hebdomadaire',
      url: ''
    };
  } else {
    // Calcul de l'index de chapitre cumulé (1-based)
    // k_ot = (W + 1) / 2 pour les semaines impaires
    // k_nt = W / 2 pour les semaines paires
    const k = isOtWeek ? Math.floor((weekIndex + 1) / 2) : Math.floor(weekIndex / 2);
    
    // Le lundi est le jour 0, donc cumulativeIndex = (k-1)*6 + 1
    // Le samedi est le jour 5, donc cumulativeIndex = (k-1)*6 + 6
    const cumulativeIndex = (k - 1) * 6 + dayOfWeek + 1;

    const { book, chapter } = getChapterFromCumulativeIndex(cumulativeIndex, testament);
    const label = `${book.name} ${chapter}`;
    
    // Format AELF : https://www.aelf.org/bible/{abbr}/{chapitre}
    const url = `https://www.aelf.org/bible/${book.aelfAbbr}/${chapter}`;

    return {
      date: dateStr,
      dayOfWeek,
      weekIndex,
      dayNumber,
      testament,
      book,
      chapter,
      isSunday: false,
      status: 'todo',
      chaptersToReview: null,
      label,
      url
    };
  }
}

/**
 * Génère une liste de jours de lecture pour une période donnée (de date de début à date de fin)
 */
export function generateReadingPlan(startDateStr: string, endDateStr: string): ReadingDay[] {
  const plan: ReadingDay[] = [];
  let currentDate = startDateStr;
  
  // Sécurité pour éviter les boucles infinies (maximum 10 ans de génération à la fois)
  const maxDays = 365 * 10;
  let daysCount = 0;

  while (currentDate <= endDateStr && daysCount < maxDays) {
    plan.push(getReadingForDate(currentDate));
    currentDate = addDays(currentDate, 1);
    daysCount++;
  }

  return plan;
}
