'use client';

import React, { useState, useMemo } from 'react';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { START_DATE_STR, formatHumanDate, addDays } from '@/utils/dateUtils';
import NoteModal from '@/components/NoteModal';
import PageHeader from '@/components/PageHeader';

export default function SearchPage() {
  const { notes, getReadingDay, getDaysForPeriod, isMounted } = useReadingPlan();
  const [query, setQuery] = useState('');
  const [selectedNoteDate, setSelectedNoteDate] = useState<string | null>(null);

  // Générer les lectures planifiées sur 3 ans à partir de la date de début du défi (pour la recherche)
  const planDaysForSearch = useMemo(() => {
    if (!isMounted) return [];
    const endDateStr = addDays(START_DATE_STR, 365 * 3); // 3 ans de planification
    return getDaysForPeriod(START_DATE_STR, endDateStr);
  }, [isMounted]);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return { notesResults: [], planResults: [] };

    // 1. Recherche dans les notes
    const notesResults = Object.values(notes)
      .filter(note => {
        return (
          note.summary.toLowerCase().includes(cleanQuery) ||
          note.verses.toLowerCase().includes(cleanQuery) ||
          note.prayer.toLowerCase().includes(cleanQuery) ||
          note.decision.toLowerCase().includes(cleanQuery) ||
          note.application.toLowerCase().includes(cleanQuery) ||
          note.date.includes(cleanQuery)
        );
      })
      .map(note => getReadingDay(note.date));

    // 2. Recherche dans le plan de lecture (livres, chapitres, dates, semaines)
    const planResults = planDaysForSearch.filter(day => {
      // Éviter les doublons avec les notes déjà affichées
      if (notes[day.date]) return false;

      const matchesBook = day.book?.name.toLowerCase().includes(cleanQuery) || false;
      const matchesChapter = day.chapter?.toString() === cleanQuery;
      const matchesBookChapter = day.label.toLowerCase().includes(cleanQuery);
      const matchesDate = day.date.includes(cleanQuery) || formatHumanDate(day.date).toLowerCase().includes(cleanQuery);
      const matchesWeek = `semaine ${day.weekIndex}`.includes(cleanQuery);

      return matchesBook || matchesChapter || matchesBookChapter || matchesDate || matchesWeek;
    }).slice(0, 50); // Caper à 50 résultats pour la lisibilité

    return { notesResults, planResults };
  }, [query, notes, planDaysForSearch, getReadingDay]);

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Recherche globale" 
        subtitle="Recherchez un livre, un chapitre, une note, une date ou une semaine." 
      />

      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Entrez un livre (ex: Genèse), un chapitre, un mot de vos notes..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all duration-200"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Résultats de la recherche */}
      {query.trim() !== '' ? (
        <div className="space-y-8">
          {/* 1. Dans les notes */}
          {searchResults.notesResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 px-2">
                Notes de méditation correspondantes ({searchResults.notesResults.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.notesResults.map(day => {
                  const note = notes[day.date];
                  return (
                    <div
                      key={day.date}
                      onClick={() => setSelectedNoteDate(day.date)}
                      className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-amber-500 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-zinc-400">
                            {formatHumanDate(day.date)}{day.dayNumber !== null ? ` • Jour ${day.dayNumber}` : ''}
                          </span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded uppercase">
                            Note rédigée
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 mt-1">
                          {day.label}
                        </h4>
                        
                        {note.verses && (
                          <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold mt-1">
                            Versets : {note.verses}
                          </p>
                        )}
                        {note.summary && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 italic">
                            "{note.summary}"
                          </p>
                        )}
                      </div>
                      
                      <span className="text-xs text-amber-700 dark:text-amber-500 font-semibold hover:underline self-start">
                        Consulter/Éditer la note
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Dans le plan de lecture */}
          {searchResults.planResults.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                Dans le plan de lecture ({searchResults.planResults.length})
              </h3>
              
              <div className="space-y-2">
                {searchResults.planResults.map(day => {
                  const isRead = day.status === 'read';
                  return (
                    <div
                      key={day.date}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400">
                            {formatHumanDate(day.date)} (Semaine {day.weekIndex}){day.dayNumber !== null ? ` • Jour ${day.dayNumber}` : ''}
                          </span>
                          {isRead && (
                            <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-1 rounded-full font-bold">
                              Lu
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                          {day.label}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedNoteDate(day.date)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          Note
                        </button>
                        
                        {!day.isSunday && (
                          <a
                            href={day.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            searchResults.notesResults.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <svg className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Aucun résultat</h4>
                <p className="text-xs text-zinc-500 mt-1">Nous n'avons trouvé aucune lecture ni note correspondant à votre recherche.</p>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-400 dark:text-zinc-600">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-xs mt-3">Saisissez un terme ci-dessus pour lancer une recherche instantanée.</p>
        </div>
      )}

      {selectedNoteDate && (
        <NoteModal
          dateStr={selectedNoteDate}
          isOpen={true}
          onClose={() => setSelectedNoteDate(null)}
        />
      )}
    </div>
  );
}
