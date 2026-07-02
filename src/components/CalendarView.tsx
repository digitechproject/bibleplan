'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReadingPlan } from '../hooks/useReadingPlan';
import { ReadingDay } from '../types';
import { 
  formatDate, 
  parseDate, 
  addDays, 
  getWeekDates, 
  getDayOfWeek, 
  formatHumanMonth, 
  formatHumanDate 
} from '../utils/dateUtils';
import NoteModal from './NoteModal';
import TodayCard from './TodayCard';

export default function CalendarView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getReadingDay, getDaysForPeriod, toggleRead, getDayNote, isMounted, todayStr } = useReadingPlan();

  // États locaux synchronisés avec l'URL
  const currentView = (searchParams.get('view') as 'week' | 'month' | 'extended') || 'month';
  const currentDateStr = searchParams.get('date') || todayStr;
  const filterTestament = (searchParams.get('testament') as 'all' | 'ot' | 'nt') || 'all';
  const filterStatus = (searchParams.get('status') as 'all' | 'todo' | 'read' | 'late' | 'review') || 'all';

  // État pour la modale de note
  const [selectedNoteDate, setSelectedNoteDate] = useState<string | null>(null);

  // Mettre à jour l'URL avec les nouveaux paramètres
  const updateUrl = (params: {
    view?: 'week' | 'month' | 'extended';
    date?: string;
    testament?: 'all' | 'ot' | 'nt';
    status?: 'all' | 'todo' | 'read' | 'late' | 'review';
  }) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    
    if (params.view) nextParams.set('view', params.view);
    if (params.date) nextParams.set('date', params.date);
    if (params.testament) nextParams.set('testament', params.testament);
    if (params.status) nextParams.set('status', params.status);

    router.push(`/calendar?${nextParams.toString()}`);
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  // --- GÉNÉRATION DES JOURS SELON LA VUE ---
  let daysToShow: ReadingDay[] = [];
  let periodTitle = '';

  if (currentView === 'week') {
    // Vue Semaine : 7 jours de la semaine courante
    const weekDates = getWeekDates(currentDateStr);
    daysToShow = weekDates.map(d => getReadingDay(d));
    
    const startHuman = formatHumanDate(weekDates[0]).split(' 202')[0]; // tronquer l'année pour raccourcir
    const endHuman = formatHumanDate(weekDates[6]);
    periodTitle = `Semaine du ${startHuman} au ${endHuman}`;

  } else if (currentView === 'month') {
    // Vue Mois : grille complète du mois de la date courante
    const date = parseDate(currentDateStr);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayStr = formatDate(firstDayOfMonth);
    const startPaddingOffset = getDayOfWeek(firstDayStr); // Jours à ajouter avant le 1er du mois
    const gridStart = addDays(firstDayStr, -startPaddingOffset);

    // Dernier jour du mois
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastDayStr = formatDate(lastDayOfMonth);
    const endPaddingOffset = 6 - getDayOfWeek(lastDayStr); // Jours à ajouter après le dernier jour
    const gridEnd = addDays(lastDayStr, endPaddingOffset);

    daysToShow = getDaysForPeriod(gridStart, gridEnd);
    periodTitle = formatHumanMonth(currentDateStr);

  } else {
    // Vue Étendue : 8 semaines à partir du lundi de la semaine courante
    const weekDates = getWeekDates(currentDateStr);
    const gridStart = weekDates[0];
    const gridEnd = addDays(gridStart, 7 * 8 - 1); // 8 semaines complètes

    daysToShow = getDaysForPeriod(gridStart, gridEnd);
    periodTitle = `Planning sur 8 semaines`;
  }

  // --- NAVIGATION TEMPORELLE ---
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const daysOffset = currentView === 'week' ? 7 : currentView === 'month' ? 30 : 56;
    const sign = direction === 'prev' ? -1 : 1;
    
    if (currentView === 'month') {
      const date = parseDate(currentDateStr);
      date.setMonth(date.getMonth() + sign);
      updateUrl({ date: formatDate(date) });
    } else {
      updateUrl({ date: addDays(currentDateStr, sign * daysOffset) });
    }
  };

  // --- APPLICATION DES FILTRES ---
  // Pour la vue mensuelle et hebdomadaire, on veut conserver les cellules de la grille 
  // mais griser/rendre inactives celles qui ne correspondent pas aux filtres.
  // Pour la vue étendue (liste continue), on peut masquer complètement pour faire un vrai résumé.
  const isFiltered = (day: ReadingDay): boolean => {
    // Filtrer par testament
    if (filterTestament === 'ot' && day.testament !== 'OT') return false;
    if (filterTestament === 'nt' && day.testament !== 'NT') return false;
    
    // Filtrer par statut
    if (filterStatus === 'read' && day.status !== 'read') return false;
    if (filterStatus === 'todo' && day.status !== 'todo') return false;
    if (filterStatus === 'late' && day.status !== 'late') return false;
    if (filterStatus === 'review' && !day.isSunday) return false;

    return true;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sélecteurs et Filtres */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Navigation de vue */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl self-start">
          {(['week', 'month', 'extended'] as const).map(view => (
            <button
              key={view}
              onClick={() => updateUrl({ view })}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                currentView === view
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              {view === 'week' ? 'Semaine' : view === 'month' ? 'Mois' : 'Planning'}
            </button>
          ))}
        </div>

        {/* Filtres de Testament */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              onClick={() => updateUrl({ testament: 'all' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filterTestament === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => updateUrl({ testament: 'ot' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filterTestament === 'ot'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              Ancien T.
            </button>
            <button
              onClick={() => updateUrl({ testament: 'nt' })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filterTestament === 'nt'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              Nouveau T.
            </button>
          </div>

          {/* Filtres de Statut */}
          <select
            value={filterStatus}
            onChange={(e) => updateUrl({ status: e.target.value as any })}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À lire</option>
            <option value="read">Lus</option>
            <option value="late">En retard</option>
            <option value="review">Révision (Dimanche)</option>
          </select>

          {/* Bouton de réinitialisation si filtres actifs */}
          {(filterTestament !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => updateUrl({ testament: 'all', status: 'all' })}
              className="text-xs text-amber-600 dark:text-amber-500 hover:underline font-semibold"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Barre de Titre et Navigation Temporelle */}
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">
          {periodTitle}
        </h2>
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => navigatePeriod('prev')}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Période précédente"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => updateUrl({ date: todayStr })}
            className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-x border-zinc-100 dark:border-zinc-800"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => navigatePeriod('next')}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Période suivante"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- AFFICHAGE SELON LA VUE --- */}

      {currentView === 'month' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md overflow-hidden">
          {/* Jours de la semaine de l'en-tête */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 text-center py-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, idx) => (
              <span key={idx} className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {d}
              </span>
            ))}
          </div>

          {/* Grille du mois */}
          <div className="grid grid-cols-7 divide-x divide-y divide-zinc-100 dark:divide-zinc-800 border-l border-t border-transparent">
            {daysToShow.map((day, idx) => {
              const isMatch = isFiltered(day);
              const isCurrentMonth = day.date.slice(5, 7) === currentDateStr.slice(5, 7);
              const isToday = day.date === todayStr;
              const hasNote = getDayNote(day.date).summary || getDayNote(day.date).verses;

              // Alternance visuelle des lignes de semaine (OT vs NT)
              const isOtWeek = day.weekIndex % 2 !== 0;

              return (
                <div
                  key={idx}
                  onClick={() => updateUrl({ date: day.date })}
                  className={`cursor-pointer min-h-[90px] md:min-h-[105px] p-2 flex flex-col justify-between transition-all duration-200 relative group ${
                    !isCurrentMonth ? 'bg-zinc-50/40 dark:bg-zinc-950/20 text-zinc-300 dark:text-zinc-700' : ''
                  } ${
                    day.date === currentDateStr
                      ? 'ring-2 ring-amber-500 ring-inset bg-amber-500/5 dark:bg-amber-950/10 z-10'
                      : isToday
                      ? 'ring-1 ring-amber-500/50 dark:ring-amber-500/30 ring-inset z-10'
                      : ''
                  } ${
                    !isMatch ? 'opacity-25' : 'opacity-100'
                  }`}
                >
                  {/* Jour et indicateur */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday 
                          ? 'bg-amber-500 text-white shadow-sm' 
                          : isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600'
                      }`}>
                        {day.date.split('-')[2]}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                        J.{day.dayNumber}
                      </span>
                    </div>
                    
                    {/* Badge type de semaine (uniquement le lundi de chaque semaine dans la grille) */}
                    {day.dayOfWeek === 0 && isCurrentMonth && (
                      <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                        isOtWeek 
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' 
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {isOtWeek ? 'AT' : 'NT'}
                      </span>
                    )}
                  </div>

                  {/* Lecture ou Révision */}
                  <div className="my-1.5 flex-1 flex flex-col justify-center">
                    {day.isSunday ? (
                      <span className="text-[10px] font-bold text-center text-amber-700 dark:text-amber-500 py-1 bg-amber-500/10 rounded-lg">
                        Révision
                      </span>
                    ) : (
                      <>
                        {/* Nom complet sur écran large */}
                        <span className="hidden sm:inline text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate" title={day.label}>
                          {day.label}
                        </span>
                        {/* Abréviation compacte sur mobile */}
                        <span className="inline sm:hidden text-[9px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate" title={day.label}>
                          {day.book ? `${day.book.aelfAbbr} ${day.chapter}` : ''}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions de pied de cellule */}
                  <div className="hidden sm:flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-1">
                      {/* Note */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNoteDate(day.date);
                        }}
                        className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                          hasNote ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-400'
                        }`}
                        title="Notes de méditation"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Lien externe (uniquement lecture) */}
                      {!day.isSunday && (
                        <a
                          href={day.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Lire le chapitre (AELF)"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Statut check */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(day.date);
                      }}
                      className={`p-1 rounded transition-colors ${
                        day.status === 'read'
                          ? 'text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          : 'text-zinc-300 dark:text-zinc-700 hover:text-emerald-600'
                      }`}
                      title={day.status === 'read' ? 'Marquer non lu' : 'Marquer lu'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Indicateur de note discret si masqué */}
                  {hasNote && (
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:hidden" />
                  )}
                  {/* Indicateur de lu discret si masqué */}
                  {day.status === 'read' && (
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:hidden" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentView === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {daysToShow.map((day, idx) => {
            const isMatch = isFiltered(day);
            if (!isMatch) return null;

            const isToday = day.date === todayStr;
            const hasNote = getDayNote(day.date).summary || getDayNote(day.date).verses;
            const isRead = day.status === 'read';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between h-48 transition-all duration-200 shadow-sm relative ${
                  isToday 
                    ? 'ring-2 ring-amber-500 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' 
                    : isRead
                    ? 'bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                        {formatHumanDate(day.date).split(' ')[0]} {day.date.split('-')[2]}
                      </span>
                      <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-500">
                        Jour {day.dayNumber}
                      </span>
                    </div>
                    {day.isSunday && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold px-1.5 py-0.2 rounded uppercase">
                        Rév.
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 mt-2">
                    {day.label}
                  </h3>
                </div>

                <div className="space-y-2">
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!day.isSunday && (
                      <a
                        href={day.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-all duration-200"
                      >
                        Lire
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedNoteDate(day.date)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-all duration-200 ${
                        hasNote 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      Note
                    </button>
                  </div>

                  <button
                    onClick={() => toggleRead(day.date)}
                    className={`w-full py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 flex items-center justify-center gap-1 ${
                      isRead
                        ? 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        : 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    }`}
                  >
                    {isRead ? 'Fait' : 'Valider'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentView === 'extended' && (
        <div className="space-y-6">
          {/* Grouper par semaine */}
          {Array.from({ length: 8 }).map((_, wIdx) => {
            const weekStart = addDays(getWeekDates(currentDateStr)[0], wIdx * 7);
            const weekEnd = addDays(weekStart, 6);
            const weekDays = daysToShow.filter(d => d.date >= weekStart && d.date <= weekEnd);
            
            const isOtWeek = weekDays[0]?.weekIndex % 2 !== 0;
            const filteredDays = weekDays.filter(d => isFiltered(d));

            if (filteredDays.length === 0) return null;

            return (
              <div 
                key={wIdx} 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                {/* En-tête de la semaine */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                      Semaine {weekDays[0]?.weekIndex}
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Du {formatHumanDate(weekStart).split(' 202')[0]} au {formatHumanDate(weekEnd)}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isOtWeek 
                      ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/30 dark:text-orange-400' 
                      : 'bg-blue-100 text-blue-850 dark:bg-blue-950/30 dark:text-blue-400'
                  }`}>
                    {isOtWeek ? 'Ancien Testament' : 'Nouveau Testament'}
                  </span>
                </div>

                {/* Liste des jours */}
                <div className="space-y-2">
                  {filteredDays.map((day, idx) => {
                    const hasNote = getDayNote(day.date).summary || getDayNote(day.date).verses;
                    const isRead = day.status === 'read';
                    const isToday = day.date === todayStr;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                          isToday 
                            ? 'border-amber-500 bg-amber-500/5' 
                            : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-900/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleRead(day.date)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 ${
                              isRead
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                            }`}
                          >
                            {isRead && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          
                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              {formatHumanDate(day.date).split(' ')[0]} {day.date.split('-')[2]} • Jour {day.dayNumber} {isToday && "• Aujourd'hui"}
                            </span>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                              {day.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Note */}
                          <button
                            onClick={() => setSelectedNoteDate(day.date)}
                            className={`p-2 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                              hasNote ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                            title="Notes"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          {/* Lire */}
                          {!day.isSunday && (
                            <a
                              href={day.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Lire (AELF)"
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
            );
          })}
        </div>
      )}

      {/* Modale de note globale */}
      {selectedNoteDate && (
        <NoteModal
          dateStr={selectedNoteDate}
          isOpen={true}
          onClose={() => setSelectedNoteDate(null)}
        />
      )}
      {/* Détail du jour sélectionné */}
      <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800/80 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 px-1">
          Détails de la lecture sélectionnée
        </h3>
        <TodayCard dateStr={currentDateStr} />
      </div>
    </div>
  );
}
