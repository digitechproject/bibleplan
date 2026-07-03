'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import TodayCard from '@/components/TodayCard';
import ProgressSummary from '@/components/ProgressSummary';
import PageHeader from '@/components/PageHeader';
import AudioPlayer from '@/components/AudioPlayer';
import YouTubePlayer from '@/components/YouTubePlayer';
import TipTapRenderer from '@/components/TipTapRenderer';
import { addDays } from '@/utils/dateUtils';

interface DailyContent {
  date: string;
  chapter_overwrite?: string;
  teaching_title?: string;
  teaching_content?: any;
  audio_url?: string;
  video_url?: string;
  prayer?: string;
  reflection_questions?: string[];
  practical_exercises?: string[];
}

export default function Home() {
  const { todayStr, getReadingDay, isMounted, profile } = useReadingPlan();
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le contenu enrichi du jour
  useEffect(() => {
    if (!isMounted || !todayStr) return;

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('*')
          .eq('date', todayStr)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setDailyContent(data);
        } else {
          setDailyContent(null);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération du contenu quotidien :", e);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [todayStr, isMounted]);

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

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-8 pb-16">
      
      {/* En-tête de bienvenue */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader title="Aujourd'hui" subtitle="Votre espace quotidien d'accompagnement et de lecture." />
        {isAdmin && (
          <Link
            href="/admin"
            className="self-start sm:self-auto px-4 py-2 bg-amber-600/10 hover:bg-amber-650/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition-all duration-200 border border-amber-600/20"
          >
            Éditer le contenu du jour
          </Link>
        )}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne gauche : Lecteur, Enseignements & Méditations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Carte de lecture du jour (calcul standard ou overwrite) */}
          <TodayCard dateStr={todayStr} />

          {/* États de chargement du contenu quotidien */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
            </div>
          ) : dailyContent ? (
            // Contenu enrichi disponible
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Titre et Enseignement */}
              {(dailyContent.teaching_title || dailyContent.teaching_content) && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                  {dailyContent.teaching_title && (
                    <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                      {dailyContent.teaching_title}
                    </h2>
                  )}
                  {dailyContent.teaching_content && (
                    <div className="prose dark:prose-invert max-w-none">
                      <TipTapRenderer content={dailyContent.teaching_content} />
                    </div>
                  )}
                </div>
              )}

              {/* Podcasts & Vidéos */}
              {(dailyContent.audio_url || dailyContent.video_url) && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Média du jour</h3>
                  {dailyContent.audio_url && (
                    <AudioPlayer src={dailyContent.audio_url} />
                  )}
                  {dailyContent.video_url && (
                    <YouTubePlayer url={dailyContent.video_url} />
                  )}
                </div>
              )}

              {/* Prière de méditation */}
              {dailyContent.prayer && (
                <div className="p-6 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider">Prière et Recueillement</h4>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm italic font-serif leading-relaxed pl-7">
                    « {dailyContent.prayer} »
                  </p>
                </div>
              )}

              {/* Grid double : Questions & Applications */}
              {(dailyContent.reflection_questions?.length || dailyContent.practical_exercises?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Questions */}
                  {dailyContent.reflection_questions && dailyContent.reflection_questions.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Questions de réflexion</h4>
                      <ul className="space-y-3">
                        {dailyContent.reflection_questions.map((q, i) => (
                          <li key={i} className="flex gap-2.5 items-start text-sm text-zinc-650 dark:text-zinc-350">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Exercices pratiques */}
                  {dailyContent.practical_exercises && dailyContent.practical_exercises.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">Applications pratiques</h4>
                      <ul className="space-y-3">
                        {dailyContent.practical_exercises.map((ex, i) => (
                          <li key={i} className="flex gap-2.5 items-start text-sm text-zinc-650 dark:text-zinc-350">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              ✓
                            </span>
                            <span className="leading-relaxed">{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            // Aucun contenu enrichi publié pour aujourd'hui
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 text-center space-y-2">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Aucun enseignement n'a été rédigé pour aujourd'hui.
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Vous pouvez lire vos chapitres standards de la journée ci-dessus.
              </p>
            </div>
          )}

          {/* Liens hier/demain (pour naviguer) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hier */}
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Lecture d'hier{yesterdayReading.dayNumber !== null ? ` • Jour ${yesterdayReading.dayNumber}` : ''}
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
                  Lecture de demain{tomorrowReading.dayNumber !== null ? ` • Jour ${tomorrowReading.dayNumber}` : ''}
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

        {/* Colonne droite : Résumé de progression */}
        <div>
          <ProgressSummary />
        </div>

      </div>
    </div>
  );
}
