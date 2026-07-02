'use client';

import React, { Suspense } from 'react';
import CalendarView from '@/components/CalendarView';
import PageHeader from '@/components/PageHeader';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendrier des lectures" 
        subtitle="Visualisez la chronologie du défi, planifiez vos lectures et gérez vos notes spirituelles." 
      />

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
