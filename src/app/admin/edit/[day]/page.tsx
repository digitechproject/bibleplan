'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import { START_DATE_STR, addDays, formatHumanDate } from '@/utils/dateUtils';
import PageHeader from '@/components/PageHeader';
import TipTapEditor from '@/components/TipTapEditor';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminEditDayPage() {
  const params = useParams();
  const router = useRouter();
  const day = params.day as string;
  const dayNum = parseInt(day, 10);

  const { user, profile, isMounted } = useReadingPlan();

  // Calculer la date correspondante à partir du numéro de jour
  const dayIndex = dayNum - 1;
  const weekIndex = Math.floor(dayIndex / 6) + 1;
  const dayOfWeek = dayIndex % 6;
  const daysOffset = (weekIndex - 1) * 7 + dayOfWeek;
  const dateStr = addDays(START_DATE_STR, daysOffset);

  // États du formulaire
  const [chapterOverwrite, setChapterOverwrite] = useState('');
  const [teachingTitle, setTeachingTitle] = useState('');
  const [teachingContent, setTeachingContent] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [prayer, setPrayer] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [exercises, setExercises] = useState<string[]>(['']);

  // États UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger le contenu existant pour ce jour
  useEffect(() => {
    if (!isMounted || !user) return;

    // Sécurité : Accès admin requis
    if (profile?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchDailyContent = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('*')
          .eq('date', dateStr)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setChapterOverwrite(data.chapter_overwrite || '');
          setTeachingTitle(data.teaching_title || '');
          setTeachingContent(data.teaching_content || null);
          setAudioUrl(data.audio_url || '');
          setVideoUrl(data.video_url || '');
          setPrayer(data.prayer || '');
          setQuestions(data.reflection_questions && data.reflection_questions.length > 0 ? data.reflection_questions : ['']);
          setExercises(data.practical_exercises && data.practical_exercises.length > 0 ? data.practical_exercises : ['']);
        }
      } catch (err: any) {
        console.error("Erreur de chargement du contenu :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyContent();
  }, [isMounted, user, profile, dateStr, router]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!res.ok) throw new Error("Impossible de générer l'URL d'upload R2");

      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error("Échec du téléversement vers Cloudflare R2");

      setAudioUrl(publicUrl);
      setStatusMessage({ type: 'success', text: 'Fichier audio téléversé avec succès vers Cloudflare R2 !' });
    } catch (err: any) {
      console.error("Erreur d'upload :", err);
      setStatusMessage({ type: 'error', text: err.message || "Erreur lors du téléversement audio." });
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const cleanQuestions = questions.filter(q => q.trim() !== '');
      const cleanExercises = exercises.filter(ex => ex.trim() !== '');

      const { error } = await supabase.from('daily_contents').upsert({
        date: dateStr,
        chapter_overwrite: chapterOverwrite || null,
        teaching_title: teachingTitle || null,
        teaching_content: teachingContent,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        prayer: prayer || null,
        reflection_questions: cleanQuestions,
        practical_exercises: cleanExercises,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setStatusMessage({ type: 'success', text: `Contenu du Jour ${dayNum} (${dateStr}) enregistré avec succès !` });
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err: any) {
      console.error("Erreur d'enregistrement :", err);
      setStatusMessage({ type: 'error', text: err.message || "Erreur lors de la publication." });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => setQuestions([...questions, '']);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx] = val;
    setQuestions(updated);
  };

  const addExercise = () => setExercises([...exercises, '']);
  const removeExercise = (idx: number) => setExercises(exercises.filter((_, i) => i !== idx));
  const updateExercise = (idx: number, val: string) => {
    const updated = [...exercises];
    updated[idx] = val;
    setExercises(updated);
  };

  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-zinc-500">Chargement de l'éditeur...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 space-y-6 max-w-5xl overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <PageHeader 
            title={`Modifier le Jour ${dayNum}`} 
            subtitle={`Planification pour le ${formatHumanDate(dateStr)} (${dateStr})`} 
          />
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            Annuler
          </button>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl border text-sm font-semibold ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Surcharger chapitre */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Lectures (Surcharger)</label>
                <input
                  type="text"
                  value={chapterOverwrite}
                  onChange={(e) => setChapterOverwrite(e.target.value)}
                  placeholder={`Défaut: Luc ${dayNum}`}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Titre enseignement */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Titre de l'enseignement</label>
              <input
                type="text"
                value={teachingTitle}
                onChange={(e) => setTeachingTitle(e.target.value)}
                placeholder="Entrez le titre inspirant de la journée..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
              />
            </div>

            {/* Corps de l'enseignement (TipTap) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Corps de l'enseignement (TipTap Editor)</label>
              <TipTapEditor
                content={teachingContent}
                onChange={(html) => setTeachingContent(html)}
              />
            </div>
          </div>

          {/* Colonne droite : Médias et métadonnées */}
          <div className="space-y-6">
            {/* Fichier Audio Cloudflare R2 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-850 dark:text-zinc-200">Fichier Audio (MP3 R2)</h3>
              
              <div className="space-y-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="block w-full text-xs text-zinc-550 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500/10 file:text-amber-700 dark:file:bg-amber-500/20 dark:file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                />
                {uploadingAudio && (
                  <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 animate-pulse">Téléversement en cours vers R2...</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">URL Audio Directe</label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="URL du fichier MP3 public R2..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Vidéo YouTube */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-850 dark:text-zinc-200">Accompagnement Vidéo</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Lien de la vidéo YouTube</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Prière suggérée */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-850 dark:text-zinc-200">Prière d'accompagnement</h3>
              <textarea
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                placeholder="Rédigez une prière de conclusion inspirante..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Questions de réflexion */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-850 dark:text-zinc-200">Questions de réflexion</h3>
                <button type="button" onClick={addQuestion} className="text-amber-600 dark:text-amber-500 hover:text-amber-700 text-xs font-bold">+</button>
              </div>
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => updateQuestion(idx, e.target.value)}
                      placeholder={`Question ${idx + 1}...`}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none"
                    />
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-600 text-xs font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications pratiques */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-850 dark:text-zinc-200">Application pratique</h3>
                <button type="button" onClick={addExercise} className="text-amber-600 dark:text-amber-500 hover:text-amber-700 text-xs font-bold">+</button>
              </div>
              <div className="space-y-2">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => updateExercise(idx, e.target.value)}
                      placeholder={`Exercice ${idx + 1}...`}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none"
                    />
                    <button type="button" onClick={() => removeExercise(idx)} className="text-red-500 hover:text-red-600 text-xs font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-400 text-zinc-950 font-extrabold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/10"
            >
              {saving ? 'Enregistrement...' : 'Publier et Sauvegarder'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
