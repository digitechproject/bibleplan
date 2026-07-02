'use client';

import React, { useState, useMemo } from 'react';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { BIBLE_BOOKS } from '@/data/bibleData';
import PageHeader from '@/components/PageHeader';

export default function ProgressPage() {
  const { readDates, stats, getReadingDay, isMounted } = useReadingPlan();
  
  // Filtre pour la liste des livres
  const [bookFilter, setBookFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'ot' | 'nt'>('all');

  // Calcul du nombre de chapitres lus uniques par livre
  const booksProgress = useMemo(() => {
    if (!isMounted) return [];

    // Dictionnaire pour enregistrer les chapitres uniques lus par livre
    const uniqueRead: Record<string, Set<number>> = {};
    
    readDates.forEach(dateStr => {
      const reading = getReadingDay(dateStr);
      if (reading.book && reading.chapter !== null) {
        const bookId = reading.book.id;
        if (!uniqueRead[bookId]) {
          uniqueRead[bookId] = new Set<number>();
        }
        uniqueRead[bookId].add(reading.chapter);
      }
    });

    return BIBLE_BOOKS.map(book => {
      const readChaptersSet = uniqueRead[book.id];
      const countRead = readChaptersSet ? readChaptersSet.size : 0;
      const percent = parseFloat(((countRead / book.chapters) * 100).toFixed(0));
      
      let status: 'todo' | 'doing' | 'done' = 'todo';
      if (countRead === book.chapters) {
        status = 'done';
      } else if (countRead > 0) {
        status = 'doing';
      }

      return {
        ...book,
        readCount: countRead,
        percent,
        status
      };
    });
  }, [isMounted, readDates, getReadingDay]);

  // Filtrer les livres
  const filteredBooks = useMemo(() => {
    return booksProgress.filter(book => {
      // Filtrer par testament
      if (testamentFilter === 'ot' && book.testament !== 'OT') return false;
      if (testamentFilter === 'nt' && book.testament !== 'NT') return false;

      // Filtrer par statut
      if (bookFilter === 'todo' && book.status !== 'todo') return false;
      if (bookFilter === 'doing' && book.status !== 'doing') return false;
      if (bookFilter === 'done' && book.status !== 'done') return false;

      return true;
    });
  }, [booksProgress, bookFilter, testamentFilter]);

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Progression de lecture" 
        subtitle="Suivez votre avancement livre par livre et observez vos statistiques s'améliorer au fil du temps." 
      />

      {/* Cartes de statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Globale */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Progression globale
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight">
                {stats.percentGlobal}%
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {stats.totalRead} / 1189 ch.
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.percentGlobal}%` }}
            />
          </div>
        </div>

        {/* Ancien Testament */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Ancien Testament
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-orange-500 dark:text-orange-400 tracking-tight">
                {stats.otPercent}%
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {stats.otRead} / 929 ch.
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.otPercent}%` }}
            />
          </div>
        </div>

        {/* Nouveau Testament */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
          <div>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Nouveau Testament
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-blue-500 dark:text-blue-400 tracking-tight">
                {stats.ntPercent}%
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {stats.ntRead} / 260 ch.
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.ntPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Liste des livres avec filtres */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
            Progression par livre ({filteredBooks.length})
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtrer par testament */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              {(['all', 'ot', 'nt'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTestamentFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    testamentFilter === t
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
                  }`}
                >
                  {t === 'all' ? 'Tous' : t === 'ot' ? 'Ancien T.' : 'Nouveau T.'}
                </button>
              ))}
            </div>

            {/* Filtrer par état d'avancement */}
            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tous les états</option>
              <option value="todo">Non commencés</option>
              <option value="doing">En cours</option>
              <option value="done">Terminés</option>
            </select>
          </div>
        </div>

        {/* Grille des livres */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => {
              return (
                <div
                  key={book.id}
                  className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 flex flex-col justify-between gap-3 shadow-sm transition-all duration-200 ${
                    book.status === 'done'
                      ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-500/2 dark:bg-emerald-950/2'
                      : book.status === 'doing'
                      ? 'border-amber-200 dark:border-amber-950 bg-amber-500/2 dark:bg-amber-950/2'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        book.testament === 'OT'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {book.testament === 'OT' ? 'Ancien T.' : 'Nouveau T.'}
                      </span>
                      
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        book.status === 'done'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : book.status === 'doing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}>
                        {book.status === 'done' ? 'Terminé' : book.status === 'doing' ? 'En cours' : 'Non lu'}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                      {book.name}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      <span>{book.readCount} / {book.chapters} ch.</span>
                      <span>{book.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          book.status === 'done' 
                            ? 'bg-emerald-500' 
                            : book.status === 'doing' 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                        style={{ width: `${book.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <svg className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Aucun livre trouvé</h4>
            <p className="text-xs text-zinc-500 mt-1">Ajustez vos filtres d'état ou de testament.</p>
          </div>
        )}
      </div>
    </div>
  );
}
