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
  const daysOffset = dayNum - 1;
  const dateStr = addDays(START_DATE_STR, daysOffset);
  const weekIndex = Math.floor(daysOffset / 7) + 1;

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  
  // Note de l'utilisateur
  const [noteSummary, setNoteSummary] = useState('');
  const [notePrayer, setNotePrayer] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const getPageUrl = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${siteUrl.replace(/\/$/, '')}/read/${dayNum}`;
  };

  const getShareText = () => {
    const rd = getReadingDay(dateStr);
    const title = content?.teaching_title || rd?.label || `Jour ${dayNum}`;
    return `📖 Défi Bible 2026 - 2030 — Jour ${dayNum}\n${title}\n\nRejoins le défi ! ${getPageUrl()}`;
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const handleShare = async () => {
    const url = getPageUrl();
    const rd = getReadingDay(dateStr);
    const title = content?.teaching_title || rd?.label || `Jour ${dayNum}`;
    // Pour navigator.share : on met le lien UNIQUEMENT dans url (pas dans text)
    // pour éviter la duplication automatique sur WhatsApp/iOS
    const shareTitle = `Jour ${dayNum} — ${title} | Défi Bible 2026 - 2030`;
    const shareText = `📖 Défi Bible 2026 - 2030 — Jour ${dayNum}\n${title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch (_) { /* annulé par l'utilisateur */ }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      handleShareWhatsApp();
    }
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

        {/* Boutons de partage */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            title="Partager sur WhatsApp"
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>

          {/* Copier le lien / partage natif */}
          <button
            onClick={handleShare}
            title={copied ? 'Lien copié !' : 'Copier le lien'}
            className={`p-2 rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${
              copied
                ? 'bg-amber-500 text-zinc-950 shadow-amber-500/20'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Header du Jour */}
      <div className="text-center space-y-3">
        <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-widest rounded-full">
          Jour {dayNum} • Semaine {weekIndex}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
          {displayTitle}
        </h1>
        <p className="text-xs text-zinc-550 font-bold">
          {formatHumanDate(dateStr)} • Par le frère Fabrice GUEDENON
        </p>
      </div>

      {/* Intégration YouTube */}
      {content?.video_url && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center">Vidéo d'accompagnement</h3>
          <YouTubePlayer url={content.video_url} />
        </div>
      )}

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
