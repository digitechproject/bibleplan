'use client';

import React, { useState, useMemo } from 'react';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { START_DATE_STR, formatHumanDate, formatHumanMonth } from '@/utils/dateUtils';
import { BIBLE_BOOKS } from '@/data/bibleData';
import NoteModal from '@/components/NoteModal';

export default function HistoryPage() {
  const { getDaysForPeriod, todayStr, toggleRead, getDayNote, isMounted } = useReadingPlan();

  // États des filtres
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [selectedTestament, setSelectedTestament] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedNoteDate, setSelectedNoteDate] = useState<string | null>(null);

  // Générer l'historique complet (du début du défi jusqu'à aujourd'hui)
  const historyDays = useMemo(() => {
    if (!isMounted) return [];
    // Générer toutes les lectures du 29 Juin 2026 à aujourd'hui
    if (todayStr < START_DATE_STR) return []; // Sécurité
    return getDaysForPeriod(START_DATE_STR, todayStr).reverse(); // Inverser pour avoir le plus récent en premier
  }, [isMounted, todayStr]);

  // Options pour les listes déroulantes de filtres
  const years = useMemo(() => {
    const yrs = new Set<string>();
    historyDays.forEach(day => {
      const year = day.date.slice(0, 4);
      yrs.add(year);
    });
    return Array.from(yrs).sort();
  }, [historyDays]);

  const booksWithLectures = useMemo(() => {
    const bks = new Set<string>();
    historyDays.forEach(day => {
      if (day.book) {
        bks.add(day.book.name);
      }
    });
    return Array.from(bks).sort();
  }, [historyDays]);

  // Filtrer les jours
  const filteredDays = useMemo(() => {
    return historyDays.filter(day => {
      // Filtrer par année
      if (selectedYear !== 'all' && day.date.slice(0, 4) !== selectedYear) return false;
      
      // Filtrer par mois
      if (selectedMonth !== 'all' && day.date.slice(5, 7) !== selectedMonth) return false;
      
      // Filtrer par testament
      if (selectedTestament !== 'all' && day.testament.toLowerCase() !== selectedTestament) return false;
      
      // Filtrer par livre
      if (selectedBook !== 'all' && day.book?.name !== selectedBook) return false;
      
      // Filtrer par statut
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'read' && day.status !== 'read') return false;
        if (selectedStatus === 'todo' && day.status !== 'todo' && day.status !== 'late') return false;
        if (selectedStatus === 'review' && !day.isSunday) return false;
      }

      return true;
    });
  }, [historyDays, selectedYear, selectedMonth, selectedBook, selectedTestament, selectedStatus]);

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        <div className="space-y-3">
          <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Historique des lectures
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Consultez et gérez vos lectures et notes passées depuis le début du défi.
        </p>
      </div>

      {/* Zone de filtres */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Filtrer l'historique
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Année */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Toutes</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mois */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tous</option>
              <option value="01">Janvier</option>
              <option value="02">Février</option>
              <option value="03">Mars</option>
              <option value="04">Avril</option>
              <option value="05">Mai</option>
              <option value="06">Juin</option>
              <option value="07">Juillet</option>
              <option value="08">Août</option>
              <option value="09">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>

          {/* Testament */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Testament</label>
            <select
              value={selectedTestament}
              onChange={(e) => setSelectedTestament(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tous</option>
              <option value="ot">Ancien</option>
              <option value="nt">Nouveau</option>
            </select>
          </div>

          {/* Livre */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Livre</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tous</option>
              {booksWithLectures.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Statut</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">Tous</option>
              <option value="read">Lus</option>
              <option value="todo">Non lus</option>
              <option value="review">Révisions</option>
            </select>
          </div>
        </div>

        {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedBook !== 'all' || selectedTestament !== 'all' || selectedStatus !== 'all') && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedBook('all');
                setSelectedTestament('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-amber-600 dark:text-amber-500 font-bold hover:underline"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Résultat de la liste */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {filteredDays.length} jour(s) trouvé(s)
          </span>
        </div>

        {filteredDays.length > 0 ? (
          <div className="space-y-2">
            {filteredDays.map((day) => {
              const hasNote = getDayNote(day.date).summary || getDayNote(day.date).verses;
              const isRead = day.status === 'read';

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 transition-all duration-200 ${
                    isRead 
                      ? 'border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/5 dark:bg-emerald-950/2'
                      : 'border-zinc-250 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleRead(day.date)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                        isRead
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                          : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                      }`}
                    >
                      {isRead && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                          {formatHumanDate(day.date)}
                        </span>
                        {day.isSunday && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold px-1.5 py-0.2 rounded uppercase">
                            Révision
                          </span>
                        )}
                      </div>
                      
                      <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                        {day.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Note Button */}
                    <button
                      onClick={() => setSelectedNoteDate(day.date)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                        hasNote
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {hasNote ? 'Voir la note' : 'Ajouter une note'}
                    </button>

                    {/* AELF Link */}
                    {!day.isSunday && (
                      <a
                        href={day.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        title="Lire sur AELF"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <svg className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="mt-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Aucun résultat trouvé</h4>
            <p className="text-xs text-zinc-500 mt-1">Ajustez vos filtres pour voir d'autres lectures.</p>
          </div>
        )}
      </div>

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
