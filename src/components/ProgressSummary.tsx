'use client';

import React from 'react';
import { useReadingPlan } from '../hooks/useReadingPlan';

export default function ProgressSummary() {
  const { stats, isMounted } = useReadingPlan();

  if (!isMounted) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-64 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md space-y-6">
      <div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Progression globale</h3>
        <p className="text-xs text-zinc-500">Pourcentage de chapitres uniques de la Bible validés</p>
      </div>

      {/* Barre globale */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight">
            {stats.percentGlobal}%
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            {stats.totalRead} lus sur 1189 ({stats.totalRemaining} restants)
          </span>
        </div>
        <div className="w-full h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-amber-600 dark:to-yellow-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.percentGlobal}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Ancien Testament */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-orange-800 dark:text-orange-400">Ancien Testament</span>
            <span className="text-zinc-500">{stats.otRead} / 929 ({stats.otPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.otPercent}%` }}
            />
          </div>
        </div>

        {/* Nouveau Testament */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-800 dark:text-blue-400">Nouveau Testament</span>
            <span className="text-zinc-500">{stats.ntRead} / 260 ({stats.ntPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.ntPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Livres complétés */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Livres terminés ({stats.completedBooks.length})
        </h4>
        {stats.completedBooks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {stats.completedBooks.map((bookName, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
              >
                {bookName}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">
            Aucun livre entièrement lu pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
