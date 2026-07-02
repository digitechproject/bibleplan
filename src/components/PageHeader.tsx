'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReadingPlan } from '../hooks/useReadingPlan';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, isMounted } = useReadingPlan();

  const isSearchPage = pathname === '/search';

  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight truncate" title={title}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Bouton de recherche */}
        {!isSearchPage && (
          <Link
            href="/search"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 shadow-sm transition-all duration-200"
            aria-label="Rechercher"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        )}

        {/* Bouton de Thème */}
        {isMounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 shadow-sm transition-all duration-200"
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
        )}
      </div>
    </div>
  );
}
