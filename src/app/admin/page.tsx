'use client';

import React, { useState, useEffect } from 'react';
import { useReadingPlan } from '@/hooks/useReadingPlan';
import { supabase } from '@/utils/supabaseClient';
import PageHeader from '@/components/PageHeader';
import TipTapEditor from '@/components/TipTapEditor';

export default function AdminPage() {
  const { user, profile, isMounted } = useReadingPlan();
  
  // États de saisie
  const [selectedDate, setSelectedDate] = useState('');
  const [chapterOverwrite, setChapterOverwrite] = useState('');
  const [teachingTitle, setTeachingTitle] = useState('');
  const [teachingContent, setTeachingContent] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [prayer, setPrayer] = useState('');
  
  // listes dynamiques (questions et exercices)
  const [questions, setQuestions] = useState<string[]>(['']);
  const [exercises, setExercises] = useState<string[]>(['']);

  // États UI
  const [loading, setLoading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Définir la date par défaut sur aujourd'hui
  useEffect(() => {
    if (isMounted) {
      const today = new Date().toISOString().slice(0, 10);
      setSelectedDate(today);
    }
  }, [isMounted]);

  // Charger le contenu existant pour la date sélectionnée
  useEffect(() => {
    if (!selectedDate || !user) return;
    
    const fetchDailyContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('daily_contents')
          .select('*')
          .eq('date', selectedDate)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = aucun enregistrement trouvé

        if (data) {
          setChapterOverwrite(data.chapter_overwrite || '');
          setTeachingTitle(data.teaching_title || '');
          setTeachingContent(data.teaching_content || null);
          setAudioUrl(data.audio_url || '');
          setVideoUrl(data.video_url || '');
          setPrayer(data.prayer || '');
          setQuestions(data.reflection_questions && data.reflection_questions.length > 0 ? data.reflection_questions : ['']);
          setExercises(data.practical_exercises && data.practical_exercises.length > 0 ? data.practical_exercises : ['']);
        } else {
          // Réinitialiser le formulaire
          setChapterOverwrite('');
          setTeachingTitle('');
          setTeachingContent(null);
          setAudioUrl('');
          setVideoUrl('');
          setPrayer('');
          setQuestions(['']);
          setExercises(['']);
        }
      } catch (err: any) {
        console.error("Erreur de chargement du contenu :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyContent();
  }, [selectedDate, user]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    setStatusMessage(null);

    try {
      // 1. Demander une URL de dépôt présignée à notre API Route
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!res.ok) throw new Error("Impossible de générer l'URL d'upload R2");

      const { uploadUrl, publicUrl } = await res.json();

      // 2. Uploader le fichier directement vers Cloudflare R2
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
    if (!selectedDate) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // Filtrer les questions et exercices vides
      const cleanQuestions = questions.filter(q => q.trim() !== '');
      const cleanExercises = exercises.filter(ex => ex.trim() !== '');

      const { error } = await supabase.from('daily_contents').upsert({
        date: selectedDate,
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

      setStatusMessage({ type: 'success', text: `Contenu du ${selectedDate} enregistré et publié avec succès !` });
    } catch (err: any) {
      console.error("Erreur d'enregistrement :", err);
      setStatusMessage({ type: 'error', text: err.message || "Erreur lors de la publication." });
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires de listes dynamiques
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

  // Sécurité d'accès admin
  if (!isMounted) return null;
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <svg className="w-12 h-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Accès Refusé</h2>
        <p className="text-sm text-zinc-500">Vous devez être connecté en tant que responsable/administrateur pour accéder à cette interface.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader 
        title="Espace Enseignant & Administration" 
        subtitle="Rédigez les enseignements, uploadez des audios R2 et configurez les vidéos d'accompagnement." 
      />

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
        
        {/* Colonne Gauche & Milieu : Édition enseignement */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sélection date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Date de publication</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Surcharger chapitre */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Surcharger le chapitre (optionnel)</label>
              <input
                type="text"
                value={chapterOverwrite}
                onChange={(e) => setChapterOverwrite(e.target.value)}
                placeholder="Ex: Matthieu 1:1-17 (si différent du calendrier)"
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
            <TipTapEditor content={teachingContent} onChange={setTeachingContent} />
          </div>

          {/* Prière du jour */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Prière du jour</label>
            <textarea
              rows={3}
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              placeholder="Rédigez une prière de méditation..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Colonne Droite : Ressources Média & Questions */}
        <div className="space-y-6">
          
          {/* Média (Audio R2 & Vidéo YouTube) */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b pb-2">Ressources Médias</h3>
            
            {/* Audio Cloudflare R2 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Fichier Audio (MP3)</label>
              <input
                type="file"
                accept="audio/mpeg"
                onChange={handleAudioUpload}
                disabled={uploadingAudio}
                className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
              {uploadingAudio && <p className="text-[10px] text-amber-600 animate-pulse font-medium">Téléversement du MP3 sur Cloudflare R2 en cours...</p>}
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Lien audio ou R2 public..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Vidéo YouTube */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Lien de la Vidéo YouTube</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Questions de réflexion */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Questions de réflexion</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="text-[10px] text-amber-600 hover:underline font-bold"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => updateQuestion(idx, e.target.value)}
                    placeholder={`Question ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Suppr
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exercices pratiques */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Exercices pratiques</h3>
              <button
                type="button"
                onClick={addExercise}
                className="text-[10px] text-amber-600 hover:underline font-bold"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ex}
                    onChange={(e) => updateExercise(idx, e.target.value)}
                    placeholder={`Exercice ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(idx)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Suppr
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de sauvegarde global */}
          <button
            type="submit"
            disabled={loading || uploadingAudio}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? "Enregistrement en cours..." : "Publier la journée"}
          </button>

        </div>
      </form>
    </div>
  );
}
