import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const START_DATE_STR = '2026-06-29';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatHumanDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

type Props = {
  params: { day: string } | Promise<{ day: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Compatible Next.js 15 et 16 (params peut être sync ou async)
  const resolvedParams = params instanceof Promise ? await params : params;
  const dayNum = parseInt(resolvedParams.day, 10);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bibleplan-bice.vercel.app').replace(/\/$/, '');
  const siteName = 'Défi Bible 2026 - 2030';

  // Valeurs par défaut robustes
  const defaultTitle = `${siteName} — Plan de lecture biblique`;
  const defaultDescription = 'Par le Frère Fabrice GUEDENON';

  if (isNaN(dayNum) || dayNum < 1) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: { title: defaultTitle, description: defaultDescription, siteName, type: 'website', locale: 'fr_FR' },
      twitter: { card: 'summary', title: defaultTitle, description: defaultDescription },
    };
  }

  // Calculer la date à partir du numéro de jour
  const daysOffset = dayNum - 1;
  const dateStr = addDays(START_DATE_STR, daysOffset);
  const weekIndex = Math.floor(daysOffset / 7) + 1;
  const humanDate = formatHumanDate(dateStr);
  const pageUrl = `${siteUrl}/read/${dayNum}`;

  let teachingTitle: string | null = null;
  let excerpt: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data } = await admin
        .from('daily_contents')
        .select('teaching_title, teaching_content')
        .eq('date', dateStr)
        .maybeSingle(); // maybeSingle évite l'erreur si 0 résultats

      if (data?.teaching_title) {
        teachingTitle = data.teaching_title;
      }
      if (data?.teaching_content) {
        excerpt = (data.teaching_content as string)
          .replace(/<[^>]*>/g, ' ')
          .replace(/&[a-z]+;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 155);
      }
    }
  } catch {
    // Silencieux : on utilise les valeurs de fallback
  }

  const title = teachingTitle
    ? `Jour ${dayNum} — ${teachingTitle} | ${siteName}`
    : `Jour ${dayNum} • Semaine ${weekIndex} | ${siteName}`;

  const description = excerpt
    ? `${humanDate} • ${excerpt}`
    : `Plan de lecture – Jour ${dayNum}, Semaine ${weekIndex} • ${humanDate}. Par le Frère Fabrice GUEDENON`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName,
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
