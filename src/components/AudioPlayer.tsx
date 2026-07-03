'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  // Réinitialise l'état si l'URL audio change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Erreur de lecture audio :", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeSpeed = () => {
    if (!audioRef.current) return;
    const nextRates = [1, 1.25, 1.5, 2];
    const currentIndex = nextRates.indexOf(playbackRate);
    const nextRate = nextRates[(currentIndex + 1) % nextRates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex items-center gap-3 transition-all duration-300">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Bouton de lecture compact */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow transition-all duration-200"
        aria-label={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Barre de contrôle horizontale */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-amber-500 cursor-pointer focus:outline-none"
        />
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0 select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Contrôle de vitesse compact */}
      <button
        onClick={changeSpeed}
        className="px-2 py-1 rounded bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-[10px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
        title="Vitesse"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
