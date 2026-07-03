'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import { START_DATE_STR, addDays, formatHumanDate } from '@/utils/dateUtils';
import AudioPlayer from '@/components/AudioPlayer';
import YouTubePlayer from '@/components/YouTubePlayer';
import TipTapRenderer from '@/components/TipTapRenderer';

export default function ReadingDayPage() {
  const params = useParams();
  const router = useRouter();
  const day = params.day as string;

  const { todayStr, readDates, toggleRead, getDayNote, saveNote, isMounted, user, profile, getReadingDay } = useReadingPlan();
  
  // Calculer la date correspondante à partir du numéro de jour
  const dayNum = parseInt(day, 10);
  const dayIndex = dayNum - 1;
  const weekIndex = Math.floor(dayIndex / 6) + 1;
  const dayOfWeek = dayIndex % 6;
  const daysOffset = (weekIndex - 1) * 7 + dayOfWeek;
  const dateStr = addDays(START_DATE_STR, daysOffset);

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  
  // Note de l'utilisateur
  const [noteSummary, setNoteSummary] = useState('');
  const [notePrayer, setNotePrayer] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Charger le contenu et appliquer le garde-fou
  useEffect(() => {
    if (!isMounted || !todayStr) return;

    // Garde-fou de sécurité : Bloquer les jours futurs pour les participants ordinaires
    const isAdmin = user && profile?.role === 'admin';
    if (dateStr > todayStr && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('*')
          .eq('date', dateStr)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) setContent(data);
      } catch (err) {
        console.error("Erreur de récupération du contenu quotidien :", err);
      } finally {
        setLoading(false);
      }
    };

    // Charger la note locale
    const existingNote = getDayNote(dateStr);
    if (existingNote) {
      setNoteSummary(existingNote.summary || '');
      setNotePrayer(existingNote.prayer || '');
    }

    fetchContent();
  }, [isMounted, todayStr, dateStr, user, profile, router]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await saveNote(dateStr, {
        summary: noteSummary,
        prayer: notePrayer,
      });
    } catch (e) {
      console.error("Erreur lors de la sauvegarde de la note :", e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleComplete = async () => {
    if (!readDates.includes(dateStr)) {
      await toggleRead(dateStr);
    }
    router.push('/');
  };

  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-zinc-500">Chargement de votre lecture...</p>
      </div>
    );
  }

  // Récupérer la vraie lecture du jour via getReadingDay
  const readingDay = getReadingDay(dateStr);
  const defaultReading = readingDay?.label || `Jour ${dayNum}`; 
  const displayTitle = content?.chapter_overwrite || defaultReading;
  const isRead = readDates.includes(dateStr);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-56 px-6 font-sans">
      {/* Barre de retour et Navigation */}
      <div className="flex justify-between items-center py-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Retour</span>
        </button>

        {profile?.role === 'admin' && (
          <button
            onClick={() => router.push(`/admin/edit/${dayNum}`)}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-bold rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Éditer (Admin)
          </button>
        )}
      </div>

      {/* Header du Jour */}
      <div className="text-center space-y-3">
        <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-widest rounded-full">
          Jour {dayNum} • Semaine {weekIndex}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
          {displayTitle}
        </h1>
        <p className="text-xs text-zinc-550 font-bold">{formatHumanDate(dateStr)}</p>
      </div>

      {/* Corps de l'enseignement (Style Blog épuré) */}
      {content?.teaching_title ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
            {content.teaching_title}
          </h2>
          <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-base border-t border-zinc-100 dark:border-zinc-800/80 pt-6">
            <TipTapRenderer content={content.teaching_content} />
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-zinc-250 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-550 font-bold">Aucun enseignement écrit n'a été rédigé pour ce jour.</p>
        </div>
      )}

      {/* Prière du jour (Épurée) */}
      {content?.prayer && (
        <div className="border-l-4 border-amber-500 pl-4 py-1 italic text-zinc-750 dark:text-zinc-300 text-sm leading-relaxed font-serif">
          <p>« {content.prayer} »</p>
        </div>
      )}

      {/* Intégration YouTube */}
      {content?.video_url && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Vidéo d'accompagnement</h3>
          <YouTubePlayer url={content.video_url} />
        </div>
      )}

      {/* Questions / Exercices (Épuré) */}
      {((content?.reflection_questions && content.reflection_questions.length > 0) || 
        (content?.practical_exercises && content.practical_exercises.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-150 dark:border-zinc-800/80 pt-8">
          {content.reflection_questions && content.reflection_questions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Questions de réflexion</h4>
              <ul className="space-y-3">
                {content.reflection_questions.map((q: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.practical_exercises && content.practical_exercises.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Application pratique</h4>
              <ul className="space-y-3">
                {content.practical_exercises.map((ex: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
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

      {/* Espace de notes personnelles (Épuré) */}
      <div className="border-t border-zinc-150 dark:border-zinc-800/80 pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Mes Notes Personnelles</h3>
          <button
            onClick={handleSaveNote}
            disabled={savingNote}
            className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-lg text-[10px] transition-colors"
          >
            {savingNote ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ce que je retiens de ma lecture</label>
            <textarea
              value={noteSummary}
              onChange={(e) => setNoteSummary(e.target.value)}
              placeholder="Écrivez un résumé ou ce qui vous a marqué..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ma prière personnelle</label>
            <textarea
              value={notePrayer}
              onChange={(e) => setNotePrayer(e.target.value)}
              placeholder="Rédigez votre prière de ce jour..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Barre d'action fixe et persistante en bas de l'écran (Lecteur audio + Validation) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800/80 py-3.5 px-6 shadow-2xl transition-all duration-300">
        <div className="max-w-2xl mx-auto space-y-3.5">
          
          {/* 1. Lecteur Audio (au-dessus) */}
          {content?.audio_url && (
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:block shrink-0 max-w-[160px]">
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Audio Enseignement</p>
                <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{displayTitle}</p>
              </div>
              <div className="flex-1">
                <AudioPlayer src={content.audio_url} />
              </div>
            </div>
          )}

          {/* 2. Bouton de validation (en dessous) */}
          <div>
            <button
              onClick={handleComplete}
              className={`w-full py-3.5 font-bold rounded-xl text-sm transition-all duration-200 shadow-md ${
                isRead 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-none' 
                  : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-500/10'
              }`}
            >
              {isRead ? 'Lecture complétée (Retour à l\'accueil)' : 'Marquer comme lu et terminer'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
