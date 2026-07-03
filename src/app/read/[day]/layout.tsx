import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

// Constantes du plan
const START_DATE_STR = '2026-06-29';

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function formatHumanDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

interface Props {
  params: Promise<{ day: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  const dayNum = parseInt(day, 10);

  if (isNaN(dayNum) || dayNum < 1) {
    return { title: 'Lecture quotidienne – Défi Bible 365' };
  }

  // Calculer la date
  const dayIndex = dayNum - 1;
  const weekIndex = Math.floor(dayIndex / 6) + 1;
  const dayOfWeek = dayIndex % 6;
  const daysOffset = (weekIndex - 1) * 7 + dayOfWeek;
  const dateStr = addDays(START_DATE_STR, daysOffset);
  const humanDate = formatHumanDate(dateStr);

  // Récupérer le titre de l'enseignement depuis Supabase
  let teachingTitle: string | null = null;
  let teachingExcerpt: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && serviceKey) {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data } = await admin
        .from('daily_contents')
        .select('teaching_title, teaching_content')
        .eq('date', dateStr)
        .single();

      if (data) {
        teachingTitle = data.teaching_title || null;
        // Extraire un extrait du contenu HTML (enlever les balises)
        if (data.teaching_content) {
          teachingExcerpt = data.teaching_content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 160);
        }
      }
    }
  } catch (_) {
    // Silencieux — les métadonnées restent génériques
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const pageUrl = `${siteUrl}/read/${dayNum}`;

  const title = teachingTitle
    ? `Jour ${dayNum} — ${teachingTitle} | Défi Bible 365`
    : `Jour ${dayNum} — Semaine ${weekIndex} | Défi Bible 365`;

  const description = teachingExcerpt
    ? `${humanDate} • ${teachingExcerpt}`
    : `Plan de lecture Bible 365 — Semaine ${weekIndex} • ${humanDate}. Rejoignez le défi de lecture biblique quotidienne.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Défi Bible 365',
      type: 'article',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default function ReadDayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
