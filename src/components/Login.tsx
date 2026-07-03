'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

interface LoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function Login({ onSuccess, onCancel }: LoginProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="w-full p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Service indisponible</h2>
        <p className="text-xs text-zinc-550 leading-relaxed">
          Les fonctionnalités de connexion et de synchronisation ne sont pas configurées. Veuillez définir les variables d'environnement Supabase réelles dans votre fichier <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-500">.env.local</code>.
        </p>
        <button
          onClick={onCancel}
          className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-all duration-200"
        >
          Fermer
        </button>
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setMessage("Un code de vérification à 6 chiffres a été envoyé à votre adresse e-mail.");
      setStep('otp');
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de l'OTP :", err);
      setError(err.message || "Impossible d'envoyer le code de vérification. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'email',
      });

      if (error) throw error;

      if (data?.session) {
        if (onSuccess) onSuccess();
      } else {
        throw new Error("La session n'a pas pu être établie. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Erreur lors de la vérification de l'OTP :", err);
      setError(err.message || "Code de vérification invalide. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {step === 'email' ? 'Connexion à Bible Plan' : 'Valider mon e-mail'}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {step === 'email' 
            ? 'Entrez votre e-mail pour vous connecter ou créer un compte par code unique.' 
            : `Saisissez le code de vérification envoyé à ${email}`}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 animate-pulse">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400">
          {message}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Recevoir mon code"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Code de vérification (6 chiffres)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-center tracking-widest text-lg font-bold transition-all duration-200"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
              disabled={loading}
            >
              Retour
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Vérification..." : "Se connecter"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
