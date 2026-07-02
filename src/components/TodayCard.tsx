'use client';

import React, { useState } from 'react';
import { useReadingPlan } from '../hooks/useReadingPlan';
import { formatHumanDate } from '../utils/dateUtils';
import NoteModal from './NoteModal';

interface TodayCardProps {
  dateStr?: string; // Optionnel (prend aujourd'hui par défaut)
}

export default function TodayCard({ dateStr }: TodayCardProps) {
  const { getReadingDay, toggleRead, isMounted, getDayNote, todayStr } = useReadingPlan();
  const targetDate = dateStr || todayStr;
  const day = getReadingDay(targetDate);
  const note = getDayNote(targetDate);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  if (!isMounted) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-64 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-6"></div>
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  const isRead = day.status === 'read';
  const hasNote = note && (note.summary || note.verses || note.prayer || note.decision || note.application);

  return (
    <div className={`w-full overflow-hidden border rounded-2xl transition-all duration-300 shadow-lg ${
      isRead
        ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
        : day.isSunday
        ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
    }`}>
      {/* En-tête de la carte */}
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              day.testament === 'OT' 
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
            }`}>
              {day.testament === 'OT' ? 'Ancien Testament' : 'Nouveau Testament'}
            </span>
            {day.dayNumber !== null && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                Jour {day.dayNumber}
              </span>
            )}
          </div>
          <h2 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-1">
            {formatHumanDate(targetDate)} {targetDate === todayStr && "• Aujourd'hui"}
          </h2>
        </div>
        
        {isRead && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Terminé
          </span>
        )}
      </div>

      {/* Contenu principal */}
      <div className="p-6 space-y-6">
        {!day.isSunday ? (
          // Jour de lecture classique
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Lecture du jour</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
                {day.label}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={day.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Optionnel : marquer comme lu automatiquement lors de l'ouverture du lien ?
                  // L'utilisateur préfère généralement décider lui-même, mais c'est bien d'inciter la lecture.
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Commencer la lecture (AELF)
              </a>

              <button
                onClick={() => toggleRead(targetDate)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                  isRead
                    ? 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    : 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                }`}
              >
                {isRead ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Marquer comme non lu
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    Marquer comme lu
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Jour de révision (Dimanche)
          <div className="space-y-4">
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold uppercase tracking-wider">
                Jour de révision
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                Récapitulatif de la semaine
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Aujourd'hui, pas de nouveau chapitre. Prenez le temps de relire et méditer sur les six chapitres lus cette semaine.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
              {day.chaptersToReview?.map((chap, i) => (
                <a
                  key={i}
                  href={`https://www.aelf.org/bible/${chap.bookAbbr}/${chap.chapter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-center text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 shadow-sm"
                >
                  {chap.bookName} {chap.chapter}
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => toggleRead(targetDate)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                  isRead
                    ? 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    : 'border-amber-600 dark:border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                }`}
              >
                {isRead ? 'Marquer la révision comme non faite' : 'Marquer la révision comme complétée'}
              </button>
            </div>
          </div>
        )}

        {/* Bouton de Notes et Aperçu */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <button
            onClick={() => setIsNoteOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {hasNote ? 'Modifier ma note' : 'Ajouter une note de méditation'}
          </button>

          {hasNote && (
            <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Note rédigée
            </span>
          )}
        </div>
      </div>

      <NoteModal
        dateStr={targetDate}
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
      />
    </div>
  );
}
