'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Tableau de bord',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: 'Site Public',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-100 min-h-screen flex flex-col border-r border-zinc-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-900 font-extrabold text-[13px]">
          DB
        </div>
        <div>
          <h1 className="font-extrabold text-xs tracking-tight text-white">Défi Bible 2026 - 2030</h1>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Espace Enseignant</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User profile snippet */}
      <div className="p-4 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600 font-bold">Version 1.1.0 • PWA</p>
      </div>
    </aside>
  );
}
