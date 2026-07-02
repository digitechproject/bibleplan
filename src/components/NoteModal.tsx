'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReadingPlan } from '../hooks/useReadingPlan';
import { formatHumanDate } from '../utils/dateUtils';

interface NoteModalProps {
  dateStr: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteModal({ dateStr, isOpen, onClose }: NoteModalProps) {
  const { getDayNote, saveNote, getReadingDay } = useReadingPlan();
  const day = getReadingDay(dateStr);
  const note = getDayNote(dateStr);

  const [summary, setSummary] = useState(note.summary || '');
  const [verses, setVerses] = useState(note.verses || '');
  const [prayer, setPrayer] = useState(note.prayer || '');
  const [decision, setDecision] = useState(note.decision || '');
  const [application, setApplication] = useState(note.application || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger la note correspondante si la date change
  useEffect(() => {
    setSummary(note.summary || '');
    setVerses(note.verses || '');
    setPrayer(note.prayer || '');
    setDecision(note.decision || '');
    setApplication(note.application || '');
    setSaveStatus('idle');
  }, [dateStr, note.summary, note.verses, note.prayer, note.decision, note.application]);

  // Sauvegarde automatique avec anti-rebond (debounce)
  const triggerAutoSave = (fields: {
    summary: string;
    verses: string;
    prayer: string;
    decision: string;
    application: string;
  }) => {
    setSaveStatus('saving');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveNote(dateStr, fields);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 800);
  };

  const handleFieldChange = (field: string, value: string) => {
    const updated = {
      summary: field === 'summary' ? value : summary,
      verses: field === 'verses' ? value : verses,
      prayer: field === 'prayer' ? value : prayer,
      decision: field === 'decision' ? value : decision,
      application: field === 'application' ? value : application
    };

    if (field === 'summary') setSummary(value);
    if (field === 'verses') setVerses(value);
    if (field === 'prayer') setPrayer(value);
    if (field === 'decision') setDecision(value);
    if (field === 'application') setApplication(value);

    triggerAutoSave(updated);
  };

  // Nettoyer le timer
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
              Notes de lecture
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {formatHumanDate(dateStr)} • {day.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="text-xs text-amber-600 dark:text-amber-500 animate-pulse">Enregistrement...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Enregistré
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulaire défilant */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[65vh]">
          {/* Versets clés */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Versets importants
            </label>
            <textarea
              rows={2}
              value={verses}
              onChange={(e) => handleFieldChange('verses', e.target.value)}
              placeholder="Ex: Jean 3:16..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:placeholder-zinc-600 transition-all duration-200 resize-none"
            />
          </div>

          {/* Ce que Dieu m'a enseigné */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Ce que Dieu m'a enseigné (Méditation)
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
              placeholder="Qu'est-ce que ce chapitre révèle sur Dieu, l'homme ou sa grâce ?"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:placeholder-zinc-600 transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prière */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Prière
              </label>
              <textarea
                rows={3}
                value={prayer}
                onChange={(e) => handleFieldChange('prayer', e.target.value)}
                placeholder="Une prière inspirée de cette lecture..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:placeholder-zinc-600 transition-all duration-200 resize-none"
              />
            </div>

            {/* Décision */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Décision / Engagement
              </label>
              <textarea
                rows={3}
                value={decision}
                onChange={(e) => handleFieldChange('decision', e.target.value)}
                placeholder="Quelle décision concrète ou action découle de cette vérité ?"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:placeholder-zinc-600 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Application personnelle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m3.12-8C16.3 8.358 17 9.24 17 10.185c0 2.21-2.91 4.54-5 5.068-2.09-.528-5-2.858-5-5.068 0-.945.7-1.827 1.88-2.185" />
              </svg>
              Application personnelle & spirituelle
            </label>
            <textarea
              rows={2}
              value={application}
              onChange={(e) => handleFieldChange('application', e.target.value)}
              placeholder="Comment appliquer cela dans mon quotidien (famille, travail, foi) ?"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:placeholder-zinc-600 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
