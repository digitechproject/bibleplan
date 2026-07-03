'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import PageHeader from '@/components/PageHeader';
import { formatHumanDate } from '@/utils/dateUtils';

interface DailyTitleInfo {
  date: string;
  teaching_title?: string;
  audio_url?: string;
  video_url?: string;
}

export default function TimelinePage() {
  const { todayStr, readDates, isMounted, getDaysForPeriod } = useReadingPlan();
  const [dailyTitles, setDailyTitles] = useState<Record<string, DailyTitleInfo>>({});
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);

  const plan = React.useMemo(() => {
    if (!todayStr) return [];
    const currentYear = todayStr.split('-')[0];
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    return getDaysForPeriod(startDate, endDate);
  }, [todayStr, getDaysForPeriod]);

  // Charger les titres des enseignements
  useEffect(() => {
    if (!isMounted) return;

    const fetchTitles = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('date, teaching_title, audio_url, video_url');

        if (error) throw error;

        const mapping: Record<string, DailyTitleInfo> = {};
        data?.forEach(item => {
          mapping[item.date] = item;
        });
        setDailyTitles(mapping);
      } catch (e) {
        console.error("Erreur lors de la récupération des titres de la timeline :", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filtrer les jours de lecture
  const filteredPlan = plan.filter(day => {
    const isRead = readDates.includes(day.date);
    if (filter === 'read') return isRead;
    if (filter === 'unread') return !isRead;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader 
          title="Timeline Moderne" 
          subtitle="Suivez le fil chronologique du défi de lecture et découvrez les thématiques quotidiennes." 
        />
        
        {/* Filtres */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            Tout
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'unread' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            À lire
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'read' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            Lus
          </button>
        </div>
      </div>

      {/* Conteneur Timeline */}
      <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 md:ml-6 pl-6 md:pl-8 space-y-6">
        
        {filteredPlan.map((day, index) => {
          const isRead = readDates.includes(day.date);
          const isCurrent = day.date === todayStr;
          const content = dailyTitles[day.date];
          
          return (
            <div key={day.date} className="relative group">
              
              {/* Repère rond sur la ligne */}
              <span className={`absolute -left-[31px] md:-left-[39px] top-4 w-4 h-4 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isRead 
                  ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-950/50 scale-110 shadow-sm shadow-emerald-500/20' 
                  : isCurrent
                  ? 'bg-amber-600 border-amber-100 dark:border-amber-950/50 scale-125 animate-pulse'
                  : 'bg-zinc-200 dark:bg-zinc-800 border-white dark:border-zinc-900'
              }`} />

              {/* Conteneur de la carte de jour */}
              <div className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 bg-white dark:bg-zinc-900 shadow-sm group-hover:shadow-md ${
                isCurrent 
                  ? 'border-amber-500/40 ring-1 ring-amber-500/10 shadow-amber-500/5' 
                  : 'border-zinc-200 dark:border-zinc-800/80'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {formatHumanDate(day.date)} {isCurrent && "• Aujourd'hui"}
                      </span>
                      {day.dayNumber !== null && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350">
                          Jour {day.dayNumber}
                        </span>
                      )}
                      {isRead && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                          Lu
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm md:text-base font-extrabold text-zinc-800 dark:text-zinc-250 leading-snug">
                      {day.label}
                    </h3>

                    {/* Titre de l'enseignement s'il existe */}
                    {content?.teaching_title && (
                      <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold italic mt-0.5">
                        « {content.teaching_title} »
                      </p>
                    )}
                  </div>

                  {/* Boutons d'action et badges médias */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    
                    {/* Badges Médias */}
                    <div className="flex items-center gap-1.5">
                      {content?.audio_url && (
                        <span title="Audio disponible" className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </span>
                      )}
                      {content?.video_url && (
                        <span title="Vidéo disponible" className="p-1 rounded-md bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Accès rapide */}
                    <Link
                      href={isCurrent ? '/' : `/calendar?date=${day.date}`}
                      className="px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                    >
                      Ouvrir
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
