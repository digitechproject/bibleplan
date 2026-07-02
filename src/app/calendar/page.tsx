'use client';

import React, { Suspense } from 'react';
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Calendrier des lectures
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Visualisez la chronologie du défi, planifiez vos lectures et gérez vos notes spirituelles.
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
        </div>
      }>
        <CalendarView />
      </Suspense>
    </div>
  );
}
