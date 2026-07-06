import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReadingPlanProvider } from "@/context/ReadingPlanContext";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Défi Bible 2026 - 2030",
  description: "Suivez et planifiez votre défi de lecture biblique de façon intelligente et autonome.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
        <ReadingPlanProvider>
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8">
            {children}
          </main>
          <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-550 dark:text-zinc-500 bg-white/40 dark:bg-zinc-950/20 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <p>Défi Bible 2026 - 2030 • Une initiative du frère Fabrice GUEDENON</p>
            </div>
          </footer>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(reg) {
                        console.log('SW enregistré:', reg.scope);
                      },
                      function(err) {
                        console.log('Échec SW:', err);
                      }
                    );
                  });
                }
              `
            }}
          />
        </ReadingPlanProvider>
      </body>
    </html>
  );
}
