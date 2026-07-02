'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import TodayCard from '@/components/TodayCard';
import ProgressSummary from '@/components/ProgressSummary';
import { addDays, formatDate, formatHumanDate } from '@/utils/dateUtils';

export default function Home() {
  const { todayStr, getReadingDay, isMounted } = useReadingPlan();

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const yesterdayStr = addDays(todayStr, -1);
  const tomorrowStr = addDays(todayStr, 1);

  const yesterdayReading = getReadingDay(yesterdayStr);
  const tomorrowReading = getReadingDay(tomorrowStr);

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Bonjour
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Prêt pour votre lecture quotidienne ?
          </p>
        </div>
        
        {/* Accès direct au calendrier */}
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-sm border border-amber-500/20 transition-all duration-200 self-start sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Voir le calendrier complet
        </Link>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche (Lecture du jour + Hier/Demain) */}
        <div className="lg:col-span-2 space-y-6">
          <TodayCard dateStr={todayStr} />

          {/* Cartes d'hier et de demain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hier */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Lecture d'hier
                </span>
                <h4 className="text-zinc-900 dark:text-zinc-50 font-bold text-sm mt-0.5 truncate">
                  {yesterdayReading.label}
                </h4>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  yesterdayReading.status === 'read'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {yesterdayReading.status === 'read' ? 'Lu' : yesterdayReading.isSunday ? 'Révision' : 'Non lu'}
                </span>
                <Link
                  href={`/calendar?date=${yesterdayStr}`}
                  className="text-xs text-amber-700 dark:text-amber-500 font-semibold hover:underline"
                >
                  Détails
                </Link>
              </div>
            </div>

            {/* Demain */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Lecture de demain
                </span>
                <h4 className="text-zinc-900 dark:text-zinc-50 font-bold text-sm mt-0.5 truncate">
                  {tomorrowReading.label}
                </h4>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {tomorrowReading.isSunday ? 'Révision' : 'À venir'}
                </span>
                <Link
                  href={`/calendar?date=${tomorrowStr}`}
                  className="text-xs text-amber-700 dark:text-amber-500 font-semibold hover:underline"
                >
                  Détails
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite (Résumé de progression) */}
        <div>
          <ProgressSummary />
        </div>
      </div>
    </div>
  );
}
