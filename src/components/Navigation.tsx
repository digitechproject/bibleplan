'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReadingPlan } from '../hooks/useReadingPlan';
import Login from './Login';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme, isMounted, user, signOut } = useReadingPlan();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navItems = [
    {
      label: 'Accueil',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'Calendrier',
      path: '/calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Historique',
      path: '/history',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Progression',
      path: '/progress',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'Recherche',
      path: '/search',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Barre de navigation supérieure (Desktop) */}
      <header className="sticky top-0 z-40 hidden md:block w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-lg tracking-tight">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Plan Bible</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isMounted && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden lg:inline text-xs text-zinc-500 truncate max-w-[150px]" title={user.email}>
                      {user.email}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Voulez-vous vous déconnecter ?')) {
                          signOut();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-655 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-semibold transition-all duration-200"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all duration-200 shadow-sm"
                  >
                    Connexion
                  </button>
                )}

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all duration-200"
                  aria-label="Changer de thème"
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M6.364 6.364l-.707-.707M17.364 17.636l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-around h-16 px-2 safe-bottom transition-colors duration-200">
        {navItems.filter(item => item.path !== '/search').map(item => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-500 font-semibold scale-105'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="mb-0.5">{item.icon}</div>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}

        {/* Item de compte Mobile */}
        <button
          onClick={() => {
            if (user) {
              if (confirm(`Connecté en tant que ${user.email}. Voulez-vous vous déconnecter ?`)) {
                signOut();
              }
            } else {
              setIsLoginOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
            user
              ? 'text-emerald-600 dark:text-emerald-500'
              : 'text-zinc-500 dark:text-zinc-550 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <div className="mb-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-wide">{user ? 'Profil' : 'Connexion'}</span>
        </button>
      </nav>

      {/* Modale de Connexion */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 z-10 p-1"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Login 
              onSuccess={() => setIsLoginOpen(false)} 
              onCancel={() => setIsLoginOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
