'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';
import PageHeader from '@/components/PageHeader';
import { START_DATE_STR, formatHumanDate } from '@/utils/dateUtils';

interface DailyTitleInfo {
  date: string;
  teaching_title?: string;
  audio_url?: string;
  video_url?: string;
}

const ITEMS_PER_PAGE = 28; // 4 semaines par page

export default function TimelinePage() {
  const { todayStr, readDates, isMounted, getDaysForPeriod } = useReadingPlan();
  const [dailyTitles, setDailyTitles] = useState<Record<string, DailyTitleInfo>>({});
  const [contentDates, setContentDates] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Générer le plan uniquement depuis START_DATE_STR jusqu'à aujourd'hui
  const plan = React.useMemo(() => {
    if (!todayStr || todayStr < START_DATE_STR) return [];
    return getDaysForPeriod(START_DATE_STR, todayStr);
  }, [todayStr, getDaysForPeriod]);

  // Charger les titres des enseignements
  useEffect(() => {
    if (!isMounted) return;

    const fetchTitles = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('date, teaching_title, audio_url, video_url');

        if (error) throw error;

        const mapping: Record<string, DailyTitleInfo> = {};
        const datesWithContent = new Set<string>();
        data?.forEach(item => {
          mapping[item.date] = item;
          if (item.teaching_title || item.audio_url || item.video_url) {
            datesWithContent.add(item.date);
          }
        });
        setDailyTitles(mapping);
        setContentDates(datesWithContent);
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

  // Pagination
  const totalPages = Math.ceil(filteredPlan.length / ITEMS_PER_PAGE);
  const paginatedPlan = filteredPlan.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (f: 'all' | 'unread' | 'read') => {
    setFilter(f);
    setPage(1); // Reset page on filter change
  };

  return (
    <div className="space-y-8 pb-16">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader 
          title="Timeline du Défi" 
          subtitle={`Jours du plan de lecture depuis le 29 juin 2026 • ${filteredPlan.length} jour(s) affiché(s)`}
        />
        
        {/* Filtres */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            Tout
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'unread' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            À lire
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'read' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            Lus
          </button>
        </div>
      </div>

      {/* Pagination haut */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              ← Précédent
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Conteneur Timeline */}
      <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 md:ml-6 pl-6 md:pl-8 space-y-6">
        
        {paginatedPlan.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8">Aucun jour à afficher pour ce filtre.</p>
        ) : (
          paginatedPlan.map((day) => {
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
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            Jour {day.dayNumber}
                          </span>
                        )}
                        {isRead && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                            Lu
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm md:text-base font-extrabold text-zinc-800 dark:text-zinc-100 leading-snug">
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

                      {/* Bouton de lecture conditionnel (uniquement jours non futurs et non dimanche) */}
                      {!day.isSunday && (
                        contentDates.has(day.date) ? (
                          <Link
                            href={`/read/${day.dayNumber}`}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold rounded-lg text-zinc-950 transition-all duration-200 shadow-sm shadow-amber-500/10"
                          >
                            Lire
                          </Link>
                        ) : (
                          <a
                            href={day.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                          >
                            Ouvrir
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination bas */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            ← Précédent
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                  p === page 
                    ? 'bg-amber-500 text-zinc-950' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
