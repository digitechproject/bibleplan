import { getReadingForDate } from './bibleUtils';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ Passed: ${message}`);
}

function runTests() {
  console.log('Début des tests de l\'algorithme de lecture biblique...\n');

  // Test 1: Premier jour du défi (Lundi 29 Juin 2026)
  // Semaine 1 (AT) -> Genèse 1
  const day1 = getReadingForDate('2026-06-29');
  assert(day1.weekIndex === 1, 'Jour 1 doit être semaine 1');
  assert(day1.dayOfWeek === 0, 'Jour 1 doit être lundi');
  assert(day1.testament === 'OT', 'Semaine 1 doit être de l\'Ancien Testament');
  assert(day1.book !== null && day1.book.id === 'genese', 'Livre doit être la Genèse');
  assert(day1.chapter === 1, 'Chapitre doit être le 1er');
  assert(day1.label === 'Genèse 1', 'Le label doit être Genèse 1');

  // Test 2: Deuxième jour du défi (Mardi 30 Juin 2026)
  const day2 = getReadingForDate('2026-06-30');
  assert(day2.book !== null && day2.book.id === 'genese', 'Jour 2 doit être la Genèse');
  assert(day2.chapter === 2, 'Jour 2 doit être le chapitre 2');

  // Test 3: Premier dimanche de révision (Dimanche 5 Juillet 2026)
  const daySunday1 = getReadingForDate('2026-07-05');
  assert(daySunday1.isSunday === true, 'Le dimanche doit être identifié comme dimanche');
  assert(daySunday1.book === null, 'Le dimanche ne doit pas avoir de livre attribué');
  assert(daySunday1.chapter === null, 'Le dimanche ne doit pas avoir de chapitre attribué');
  assert(daySunday1.chaptersToReview !== null && daySunday1.chaptersToReview.length === 6, 'Doit réviser 6 chapitres');
  assert(daySunday1.chaptersToReview![0].bookName === 'Genèse' && daySunday1.chaptersToReview![0].chapter === 1, 'Premier chapitre à réviser doit être Genèse 1');
  assert(daySunday1.chaptersToReview![5].bookName === 'Genèse' && daySunday1.chaptersToReview![5].chapter === 6, 'Dernier chapitre à réviser doit être Genèse 6');

  // Test 4: Début de la Semaine 2 (Lundi 6 Juillet 2026)
  // Semaine 2 (NT) -> Matthieu 1
  const dayWeek2 = getReadingForDate('2026-07-06');
  assert(dayWeek2.weekIndex === 2, 'Semaine doit être 2');
  assert(dayWeek2.testament === 'NT', 'Semaine 2 doit être du Nouveau Testament');
  assert(dayWeek2.book !== null && dayWeek2.book.id === 'matthieu', 'Livre doit être Matthieu');
  assert(dayWeek2.chapter === 1, 'Chapitre doit être le 1er');

  // Test 5: Reprise de l'Ancien Testament en Semaine 3 (Lundi 13 Juillet 2026)
  // Semaine 3 (AT) -> Genèse 7 (reprend après Genèse 6)
  const dayWeek3 = getReadingForDate('2026-07-13');
  assert(dayWeek3.weekIndex === 3, 'Semaine doit être 3');
  assert(dayWeek3.testament === 'OT', 'Semaine 3 doit être de l\'Ancien Testament');
  assert(dayWeek3.book !== null && dayWeek3.book.id === 'genese', 'Livre doit être la Genèse');
  assert(dayWeek3.chapter === 7, 'Chapitre doit être le 7e (après la pause du NT)');

  // Test 6: Passage au livre suivant (Matthieu a 28 chapitres)
  // Semaine NT 5 (Semaine de défi 10)
  // Semaine NT 5 lit les chapitres cumulés 25 à 30 du NT
  // Lundi = 25 (Matthieu 25)
  // Mardi = 26 (Matthieu 26)
  // Mercredi = 27 (Matthieu 27)
  // Jeudi = 28 (Matthieu 28 - Fin du livre)
  // Vendredi = 29 (Marc 1 - Début du livre suivant)
  // Samedi = 30 (Marc 2)
  const dayMtEnd = getReadingForDate('2026-09-03'); // Jeudi de la semaine 10
  assert(dayMtEnd.book !== null && dayMtEnd.book.id === 'matthieu', 'Jeudi de la semaine 10 doit être Matthieu');
  assert(dayMtEnd.chapter === 28, 'Jeudi doit être Matthieu 28');

  const dayMcStart = getReadingForDate('2026-09-04'); // Vendredi de la semaine 10
  assert(dayMcStart.book !== null && dayMcStart.book.id === 'marc', 'Vendredi de la semaine 10 doit être Marc (passage auto au livre suivant)');
  assert(dayMcStart.chapter === 1, 'Vendredi doit être Marc 1');

  console.log('\nTous les tests unitaires ont réussi avec succès !');
}

runTests();
