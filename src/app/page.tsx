'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import TodayCard from '@/components/TodayCard';
import ProgressSummary from '@/components/ProgressSummary';
import PageHeader from '@/components/PageHeader';

export default function Home() {
  const { todayStr, isMounted, profile } = useReadingPlan();

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

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-8 pb-16">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader title="Aujourd'hui" subtitle="Votre espace quotidien d'accompagnement et de lecture." />
        {isAdmin && (
          <Link
            href="/admin"
            className="self-start sm:self-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-amber-500/10"
          >
            Espace Enseignant
          </Link>
        )}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Carte de lecture principale */}
        <div className="lg:col-span-2 space-y-8">
          <TodayCard dateStr={todayStr} />
        </div>

        {/* Colonne droite : Résumé de progression */}
        <div>
          <ProgressSummary />
        </div>
      </div>
    </div>
  );
}
