'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import { START_DATE_STR, addDays, formatHumanDate } from '@/utils/dateUtils';
import PageHeader from '@/components/PageHeader';
import AdminSidebar from '@/components/AdminSidebar';

interface DayStatus {
  date: string;
  dayNum: number;
  title: string | null;
  hasAudio: boolean;
  hasVideo: boolean;
  hasContent: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, isMounted } = useReadingPlan();

  const [searchQuery, setSearchQuery] = useState('');
  const [days, setDays] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalConfigs: 0, audioCount: 0, videoCount: 0 });

  useEffect(() => {
    if (!isMounted || !user) return;

    // Sécurité d'accès admin
    if (profile?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchAllDaysStatus = async () => {
      try {
        // 1. Récupérer tous les daily_contents configurés
        const { data: contents, error } = await supabase
          .from('daily_contents')
          .select('date, teaching_title, audio_url, video_url, teaching_content');

        if (error) throw error;

        // 2. Générer la liste des 365 jours de lecture
        const daysList: DayStatus[] = [];
        let configured = 0;
        let audios = 0;
        let videos = 0;

        for (let i = 1; i <= 365; i++) {
          const dayIndex = i - 1;
          const weekIndex = Math.floor(dayIndex / 6) + 1;
          const dayOfWeek = dayIndex % 6;
          const daysOffset = (weekIndex - 1) * 7 + dayOfWeek;
          const dateStr = addDays(START_DATE_STR, daysOffset);

          // Chercher le contenu Supabase correspondant
          const content = contents?.find(c => c.date === dateStr);

          const hasAudio = !!content?.audio_url;
          const hasVideo = !!content?.video_url;
          const hasContent = !!content?.teaching_content;

          if (content) {
            configured++;
            if (hasAudio) audios++;
            if (hasVideo) videos++;
          }

          daysList.push({
            date: dateStr,
            dayNum: i,
            title: content?.teaching_title || null,
            hasAudio,
            hasVideo,
            hasContent,
          });
        }

        setDays(daysList);
        setStats({ totalConfigs: configured, audioCount: audios, videoCount: videos });
      } catch (err) {
        console.error("Erreur de chargement du dashboard admin :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDaysStatus();
  }, [isMounted, user, profile, router]);

  // Filtrer les jours selon la recherche (recherche par numéro de jour ou titre)
  const filteredDays = days.filter(
    (d) =>
      d.dayNum.toString().includes(searchQuery) ||
      (d.title && d.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.date.includes(searchQuery)
  );

  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-zinc-500">Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Sidebar de navigation */}
      <AdminSidebar />

      {/* Contenu principal */}
      <main className="flex-1 p-8 space-y-8 max-w-5xl overflow-y-auto">
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <PageHeader 
            title="Espace Enseignant & Administration" 
            subtitle="Gérez le plan de lecture de 1 an, rédigez les enseignements, uploadez les MP3 vers R2." 
          />
        </div>

        {/* Bloc Statistiques SaaS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Jours configurés</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{stats.totalConfigs} / 365</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Audios hébergés R2</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{stats.audioCount} MP3</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vidéos YouTube</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{stats.videoCount} Liens</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Section de gestion des Jours */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Header de Recherche */}
          <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Liste des Jours du Plan</h3>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Rechercher (ex: 9, Luc 1, 2026)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Tableau des jours */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Jour</th>
                  <th className="px-6 py-4">Date de lecture</th>
                  <th className="px-6 py-4">Enseignement Titre</th>
                  <th className="px-6 py-4">Contenus configurés</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-xs">
                {filteredDays.length > 0 ? (
                  filteredDays.slice(0, 50).map((d) => (
                    <tr key={d.dayNum} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        Jour {d.dayNum}
                      </td>
                      <td className="px-6 py-4 text-zinc-550 dark:text-zinc-400">
                        {formatHumanDate(d.date)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {d.title ? (
                          <span className="text-zinc-800 dark:text-zinc-200">{d.title}</span>
                        ) : (
                          <span className="text-zinc-400 italic">Aucun titre défini</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          {d.hasContent ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold">Écrit</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded text-[9px] font-semibold">Vide</span>
                          )}
                          {d.hasAudio && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold">Audio</span>
                          )}
                          {d.hasVideo && (
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-700 dark:text-red-400 rounded text-[9px] font-bold">Vidéo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/edit/${d.dayNum}`)}
                          className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-950 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          Éditer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 font-bold">
                      Aucun jour ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredDays.length > 50 && (
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/20 text-center border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold">
              Affichage des 50 premiers résultats (sur {filteredDays.length}). Affinez votre recherche si besoin.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
